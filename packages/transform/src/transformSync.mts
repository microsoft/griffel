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
import type { StyleCall } from './types.mjs';

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
  modules?: string[];

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
    modules = ['@griffel/core', '@griffel/react', '@fluentui/react-components'],
    evaluationRules = [{ action: perfIssues ? wrapWithPerfIssues(shakerEvaluator, perfIssues) : shakerEvaluator }],
    astEvaluationPlugins = [fluentTokensPlugin],
  } = options;

  if (!filename) {
    throw new Error('Transform error: "filename" option is required');
  }

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
      modules.includes(si.moduleRequest.value) &&
      si.entries.some(e => e.importName.kind === 'Name' && RUNTIME_IDENTIFIERS.has(e.importName.name as FunctionKinds)),
  );

  if (!hasGriffelImports) {
    return { code: sourceCode, usedProcessing: false, usedVMForEvaluation: false };
  }

  const styleCalls: StyleCall[] = [];
  const cssEntries: Record<string, Record<string, string[]>> = {};
  const cssResetEntries: Record<string, string[]> = {};

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

        if (!modules.includes(importSource)) {
          return;
        }

        const imported = declaration.node.imported;

        if (imported.type !== 'Identifier') {
          return;
        }

        const importedName = imported.name;

        if (!RUNTIME_IDENTIFIERS.has(importedName as FunctionKinds)) {
          return;
        }

        const functionKind = importedName as FunctionKinds;

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

        while (current) {
          if (!current) {
            break;
          }

          if (current.type === 'VariableDeclarator' && current.id.type === 'Identifier') {
            declaratorId = current.id.name;
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
          const uniqueCSSRules = dedupeCSSRules(cssRulesByBucket);

          if (generateMetadata) {
            buildCSSEntriesMetadata(cssEntries, classnamesMapping, uniqueCSSRules, styleCall.declaratorId);
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
  };
}
