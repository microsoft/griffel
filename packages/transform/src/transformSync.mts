import { parseSync, type Node } from 'oxc-parser';
import { walk, ScopeTracker, type ScopeTrackerImport } from 'oxc-walker';
import MagicString from 'magic-string';
import shakerEvaluator from '@griffel/transform-shaker';

import type { TransformResolver } from './evaluation/module.mjs';
import type { Evaluator, EvalRule, TransformPerfIssue } from './evaluation/types.mjs';
import {
  resolveStyleRulesForSlots,
  resolveResetStyleRules,
  resolveStaticStyleRules,
  normalizeCSSBucketEntry,
  type GriffelStyle,
  type GriffelStaticStyles,
  type CSSRulesByBucket,
  type CSSClassesMapBySlot,
  type GriffelResetStyle,
} from '@griffel/core';

import { batchEvaluator } from './evaluation/batchEvaluator.mjs';
import { fluentTokensPlugin } from './evaluation/fluentTokensPlugin.mjs';
import type { AstEvaluatorPlugin } from './evaluation/types.mjs';
import { dedupeCSSRules } from './utils/dedupeCSSRules.mjs';
import type { StyleCall, ModuleConfig, SourceLocation, CommentDirective, TransformMetadata } from './types.mjs';

export type TransformOptions = {
  filename: string;

  /** Custom module resolver used to resolve imports inside evaluated modules. */
  resolveModule: TransformResolver;

  classNameHashSalt?: string;

  /**
   * Returns the evaluated CSS rules in the file result metadata
   * @default false
   */
  generateMetadata?: boolean;

  /** Defines set of modules and imports handled by a transformPlugin. */
  modules?: (string | ModuleConfig)[];

  /** The set of rules that defines how the matched files will be transformed during the evaluation. */
  evaluationRules?: EvalRule[];

  /** Plugins for extending AST evaluation with custom node handling. */
  astEvaluationPlugins?: AstEvaluatorPlugin[];

  /**
   * Collects performance issues (CJS modules, barrel re-exports) during evaluation.
   * @default false
   */
  collectPerfIssues?: boolean;
};

export type TransformResult = {
  code: string;
  cssRulesByBucket?: CSSRulesByBucket;
  usedProcessing: boolean;
  usedVMForEvaluation: boolean;
  perfIssues?: TransformPerfIssue[];
  metadata?: TransformMetadata;
};

type FunctionKinds = 'makeStyles' | 'makeResetStyles' | 'makeStaticStyles';

const EXPORT_STAR_RE = /export\s+\*\s+from\s/;

function wrapWithPerfIssues(evaluator: Evaluator, perfIssues: TransformPerfIssue[]): Evaluator {
  return (filename, text, only) => {
    const result = evaluator(filename, text, only);

    if (result.moduleKind === 'cjs') {
      perfIssues.push({ type: 'cjs-module', dependencyFilename: filename });
    } else if (EXPORT_STAR_RE.test(result.code)) {
      perfIssues.push({ type: 'barrel-export-star', dependencyFilename: filename });
    }

    return result;
  };
}

const RUNTIME_IDENTIFIERS = new Map<FunctionKinds, string>([
  ['makeStyles', '__css'],
  ['makeResetStyles', '__resetCSS'],
  ['makeStaticStyles', '__staticCSS'],
]);

/**
 * Extracts CSS rules from evaluated reset styles to metadata
 */
function buildCSSResetEntriesMetadata(
  cssResetEntries: Record<string, string[]>,
  cssRules: string[] | CSSRulesByBucket,
  declaratorId: string,
) {
  const cssRulesByBucket: CSSRulesByBucket = Array.isArray(cssRules) ? { d: cssRules } : cssRules;
  cssResetEntries[declaratorId] ??= [];
  cssResetEntries[declaratorId] = Object.values(cssRulesByBucket).flatMap(bucketEntries => {
    return bucketEntries.map(bucketEntry => {
      if (Array.isArray(bucketEntry)) {
        throw new Error(
          `CSS rules in buckets for "makeResetStyles()" should not contain arrays, got: ${JSON.stringify(
            bucketEntry,
          )})}`,
        );
      }

      return bucketEntry;
    });
  });
}

/**
 * Extracts CSS rules from evaluated styles to metadata
 */
function buildCSSEntriesMetadata(
  cssEntries: Record<string, Record<string, string[]>>,
  classnamesMapping: CSSClassesMapBySlot<string>,
  cssRulesByBucket: CSSRulesByBucket,
  declaratorId: string,
) {
  const classesBySlot: Record<string, string[]> = Object.fromEntries(
    Object.entries(classnamesMapping).map(([slot, cssClassesMap]) => {
      const uniqueClasses = new Set<string>();
      Object.values(cssClassesMap).forEach(cssClasses => {
        if (typeof cssClasses === 'string') {
          uniqueClasses.add(cssClasses);
        } else if (Array.isArray(cssClasses)) {
          cssClasses.forEach(cssClass => uniqueClasses.add(cssClass));
        }
      });
      return [slot, Array.from(uniqueClasses)];
    }),
  );

  const cssRules: string[] = Object.values(cssRulesByBucket).flatMap(cssRulesByBucket => {
    return cssRulesByBucket.map(bucketEntry => {
      const [cssRule] = normalizeCSSBucketEntry(bucketEntry);
      return cssRule;
    });
  });

  cssEntries[declaratorId] = Object.fromEntries(
    Object.entries(classesBySlot).map(([slot, cssClasses]) => {
      return [
        slot,
        cssClasses.map(cssClass => {
          return cssRules.find(rule => rule.includes(cssClass))!;
        }),
      ];
    }),
  );
}

function concatCSSRulesByBucket(bucketA: CSSRulesByBucket = {}, bucketB: CSSRulesByBucket) {
  for (const cssBucketName in bucketB) {
    const bucketName = cssBucketName as keyof CSSRulesByBucket;
    const bucketBEntries = bucketB[bucketName] ?? [];

    if (bucketA[bucketName]) {
      bucketA[bucketName].push(...bucketBEntries);
    } else {
      bucketA[bucketName] = bucketBEntries;
    }
  }

  return bucketA;
}

function normalizeModules(modules: (string | ModuleConfig)[]): ModuleConfig[] {
  return modules.map(m => {
    if (typeof m === 'string') {
      return { moduleSource: m, importName: 'makeStyles', resetImportName: 'makeResetStyles', staticImportName: 'makeStaticStyles' };
    }
    return {
      moduleSource: m.moduleSource,
      importName: m.importName ?? 'makeStyles',
      resetImportName: m.resetImportName ?? 'makeResetStyles',
      staticImportName: m.staticImportName ?? 'makeStaticStyles',
    };
  });
}

/**
 * Builds a lookup map: (moduleSource, importedName) → FunctionKinds
 */
function buildImportLookup(configs: ModuleConfig[]): Map<string, FunctionKinds> {
  const lookup = new Map<string, FunctionKinds>();
  for (const cfg of configs) {
    lookup.set(`${cfg.moduleSource}\0${cfg.importName}`, 'makeStyles');
    lookup.set(`${cfg.moduleSource}\0${cfg.resetImportName}`, 'makeResetStyles');
    lookup.set(`${cfg.moduleSource}\0${cfg.staticImportName}`, 'makeStaticStyles');
  }
  return lookup;
}

function buildLineStarts(source: string): number[] {
  const starts = [0];
  for (let i = 0; i < source.length; i++) {
    if (source[i] === '\n') {
      starts.push(i + 1);
    }
  }
  return starts;
}

function offsetToLocation(lineStarts: number[], offset: number): { line: number; column: number; index: number } {
  // Binary search for the line
  let lo = 0;
  let hi = lineStarts.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (lineStarts[mid] <= offset) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }
  return { line: lo + 1, column: offset - lineStarts[lo], index: offset };
}

function makeSourceLocation(lineStarts: number[], start: number, end: number): SourceLocation {
  return { start: offsetToLocation(lineStarts, start), end: offsetToLocation(lineStarts, end) };
}

function parseCommentDirectives(
  comments: { type: string; value: string; start: number; end: number }[],
  rangeStart: number,
  rangeEnd: number,
): CommentDirective[] | null {
  const entries: CommentDirective[] = [];
  for (const comment of comments) {
    if (comment.type !== 'Line') continue;
    if (comment.start < rangeStart || comment.start >= rangeEnd) continue;
    const value = comment.value.trim();
    if (!value.startsWith('griffel-')) continue;
    const tokens = value.split(' ');
    entries.push([tokens[0], tokens[1]]);
  }
  return entries.length > 0 ? entries : null;
}

/**
 * Transforms passed source code with oxc-parser and oxc-walker instead of Babel.
 */
export function transformSync(sourceCode: string, options: TransformOptions): TransformResult {
  const perfIssues = options.collectPerfIssues ? ([] as TransformPerfIssue[]) : undefined;

  const {
    filename,
    resolveModule,
    classNameHashSalt = '',
    generateMetadata = false,
    modules: rawModules = ['@griffel/core', '@griffel/react', '@fluentui/react-components'],
    evaluationRules = [{ action: perfIssues ? wrapWithPerfIssues(shakerEvaluator, perfIssues) : shakerEvaluator }],
    astEvaluationPlugins = [fluentTokensPlugin],
  } = options;

  if (!filename) {
    throw new Error('Transform error: "filename" option is required');
  }

  const normalizedModules = normalizeModules(rawModules);
  const importLookup = buildImportLookup(normalizedModules);
  const moduleSources = new Set(normalizedModules.map(m => m.moduleSource));

  const parseResult = parseSync(filename, sourceCode);

  if (parseResult.errors.length > 0) {
    throw new Error(`Failed to parse "${filename}": ${parseResult.errors.map(e => e.message).join(', ')}`);
  }

  if (parseResult.program.body.length > 0 && !parseResult.module.hasModuleSyntax) {
    throw new Error(
      `Transform error: "${filename}" is not an ES module. ` +
        `@griffel/transform only supports ES modules (files using import/export syntax).`,
    );
  }

  const magicString = new MagicString(sourceCode);
  const programAst = parseResult.program;

  // Quick bail-out: if no Griffel imports exist, skip the AST walk entirely
  const hasGriffelImports = parseResult.module.staticImports.some(
    si =>
      moduleSources.has(si.moduleRequest.value) &&
      si.entries.some(e => e.importName.kind === 'Name' && importLookup.has(`${si.moduleRequest.value}\0${e.importName.name}`)),
  );

  if (!hasGriffelImports) {
    return { code: sourceCode, usedProcessing: false, usedVMForEvaluation: false };
  }

  const styleCalls: StyleCall[] = [];
  const cssEntries: Record<string, Record<string, string[]>> = {};
  const cssResetEntries: Record<string, string[]> = {};

  const callExpressionLocations: Record<string, SourceLocation> = {};
  const locations: Record<string, Record<string, SourceLocation>> = {};
  const resetLocations: Record<string, SourceLocation> = {};
  const commentDirectives: Record<string, Record<string, CommentDirective[]>> = {};
  const resetCommentDirectives: Record<string, CommentDirective[]> = {};

  const lineStarts = generateMetadata ? buildLineStarts(sourceCode) : [];

  let cssRulesByBucket: CSSRulesByBucket = {};

  // -----
  // Walk AST to collect style function calls using ScopeTracker for scope-aware import resolution

  const scopeTracker = new ScopeTracker();
  const matchedSpecifiers = new Map<number, { start: number; end: number; functionKind: FunctionKinds }>();

  walk(programAst, {
    scopeTracker,
    enter(node, parent) {
      if (node.type === 'CallExpression' && node.callee.type === 'Identifier') {
        const declaration = scopeTracker.getDeclaration(node.callee.name) as ScopeTrackerImport | null;

        if (declaration?.type !== 'Import' || declaration.node.type !== 'ImportSpecifier') {
          return;
        }

        const importSource = declaration.importNode.source.value;

        if (!moduleSources.has(importSource)) {
          return;
        }

        const imported = declaration.node.imported;

        if (imported.type !== 'Identifier') {
          return;
        }

        const lookupKey = `${importSource}\0${imported.name}`;
        const functionKind = importLookup.get(lookupKey);

        if (!functionKind) {
          return;
        }

        if (node.arguments.length !== 1) {
          throw new Error(`${functionKind}() function accepts only a single param`);
        }

        // Track the import specifier for rewriting (deduped by node start position)
        matchedSpecifiers.set(declaration.node.start, {
          start: declaration.node.start,
          end: declaration.node.end,
          functionKind,
        });

        // Find the variable declarator to get the hook name
        let declaratorId = 'unknownHook';
        let current: Node | null = parent;
        let variableDeclaratorNode: Node | null = null;

        while (current) {
          if (!current) {
            break;
          }

          if (current.type === 'VariableDeclarator' && current.id.type === 'Identifier') {
            declaratorId = current.id.name;
            variableDeclaratorNode = current;
            break;
          }

          if ('parent' in current) {
            current = current.parent as Node | null;
            continue;
          }

          break;
        }

        const argument = node.arguments[0];

        styleCalls.push({
          declaratorId,
          functionKind,

          argumentStart: argument.start,
          argumentEnd: argument.end,
          argumentCode: sourceCode.slice(argument.start, argument.end),
          argumentNode: argument,

          callStart: node.start,
          callEnd: node.end,

          importId: node.callee.name,
        });

        // --- Metadata collection ---
        if (generateMetadata) {
          callExpressionLocations[declaratorId] = makeSourceLocation(lineStarts, node.start, node.end);

          if (functionKind === 'makeStyles' && argument.type === 'ObjectExpression') {
            locations[declaratorId] ??= {};
            commentDirectives[declaratorId] ??= {};

            const properties = argument.properties;
            for (let pi = 0; pi < properties.length; pi++) {
              const prop = properties[pi];
              if (prop.type !== 'Property') continue;
              const key = prop.key;
              if (key.type !== 'Identifier') continue;

              locations[declaratorId][key.name] = makeSourceLocation(lineStarts, prop.start, prop.end);

              // Collect comment directives between previous property end and this property start
              const rangeStart = pi === 0 ? argument.start : properties[pi - 1].end;
              const directives = parseCommentDirectives(parseResult.comments, rangeStart, prop.start);
              if (directives) {
                commentDirectives[declaratorId][key.name] = directives;
              }
            }
          }

          if (functionKind === 'makeResetStyles') {
            if (argument.type === 'ObjectExpression') {
              resetLocations[declaratorId] = makeSourceLocation(lineStarts, argument.start, argument.end);
            }

            // Collect comment directives from before the VariableDeclaration or ExportNamedDeclaration parent
            // Find the top-level statement that contains this call expression
            const containingStatement = programAst.body.find(
              stmt => stmt.start <= node.start && stmt.end >= node.end,
            );

            if (containingStatement) {
              let rangeStart = 0;
              for (const bodyNode of programAst.body) {
                if (bodyNode.start >= containingStatement.start) break;
                rangeStart = bodyNode.end;
              }
              const directives = parseCommentDirectives(parseResult.comments, rangeStart, containingStatement.start);
              if (directives) {
                resetCommentDirectives[declaratorId] = directives;
              }
            }
          }
        }
      }
    },
  });

  // If no style calls found, return original code
  if (styleCalls.length === 0) {
    return {
      code: sourceCode,
      usedProcessing: false,
      usedVMForEvaluation: false,
    };
  }

  // Process style calls - evaluate and transform
  const { evaluationResults, usedVMForEvaluation } = batchEvaluator(
    sourceCode,
    filename,
    styleCalls,
    evaluationRules,
    resolveModule,
    programAst,
    astEvaluationPlugins,
  );

  for (let i = 0; i < styleCalls.length; i++) {
    const styleCall = styleCalls[i];
    const evaluationResult = evaluationResults[i];

    switch (styleCall.functionKind) {
      case 'makeStyles':
        {
          const stylesBySlots = evaluationResult as Record<string, GriffelStyle>;
          const [classnamesMapping, resolvedCSSRules] = resolveStyleRulesForSlots(stylesBySlots, classNameHashSalt);

          if (generateMetadata) {
            buildCSSEntriesMetadata(cssEntries, classnamesMapping, resolvedCSSRules, styleCall.declaratorId);
          }

          // Replace the function call arguments
          magicString.overwrite(styleCall.argumentStart, styleCall.argumentEnd, `${JSON.stringify(classnamesMapping)}`);
          cssRulesByBucket = concatCSSRulesByBucket(cssRulesByBucket, resolvedCSSRules);
        }

        break;

      case 'makeResetStyles':
        {
          const styles = evaluationResult as GriffelResetStyle;
          const [ltrClassName, rtlClassName, cssRules] = resolveResetStyleRules(styles, classNameHashSalt);

          if (generateMetadata) {
            buildCSSResetEntriesMetadata(cssResetEntries, cssRules, styleCall.declaratorId);
          }

          // Replace the function call arguments
          magicString.overwrite(
            styleCall.argumentStart,
            styleCall.argumentEnd,
            `${JSON.stringify(ltrClassName)}, ${JSON.stringify(rtlClassName)}`,
          );
          cssRulesByBucket = concatCSSRulesByBucket(
            cssRulesByBucket,
            Array.isArray(cssRules) ? { r: cssRules } : cssRules,
          );
        }
        break;

      case 'makeStaticStyles':
        {
          const styles = evaluationResult as GriffelStaticStyles | GriffelStaticStyles[];
          const stylesSet: GriffelStaticStyles[] = Array.isArray(styles) ? styles : [styles];
          const cssRules = resolveStaticStyleRules(stylesSet);

          // Replace the function call arguments with the resolved CSS rules bucket
          magicString.overwrite(styleCall.argumentStart, styleCall.argumentEnd, JSON.stringify({ d: cssRules }));
          cssRulesByBucket = concatCSSRulesByBucket(cssRulesByBucket, { d: cssRules });
        }
        break;
    }
  }

  // ---
  // Transform imports and function names

  for (const specifier of matchedSpecifiers.values()) {
    magicString.overwrite(specifier.start, specifier.end, RUNTIME_IDENTIFIERS.get(specifier.functionKind)!);
  }

  // ---
  // Transform function call names

  for (const styleCall of styleCalls) {
    magicString.overwrite(
      styleCall.callStart,
      styleCall.callStart + styleCall.importId.length,
      RUNTIME_IDENTIFIERS.get(styleCall.functionKind)!,
    );
  }

  return {
    code: magicString.toString(),
    cssRulesByBucket,
    usedProcessing: true,
    usedVMForEvaluation,
    perfIssues,
    ...(generateMetadata && {
      metadata: {
        cssEntries,
        cssResetEntries,
        callExpressionLocations,
        locations,
        resetLocations,
        commentDirectives,
        resetCommentDirectives,
      },
    }),
  };
}
