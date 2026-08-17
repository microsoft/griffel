import { parseSync, type Node, type ParseResult } from 'oxc-parser';
import { walk, ScopeTracker, type ScopeTrackerImport } from 'oxc-walker';
import MagicString from 'magic-string';
import shakerEvaluator from '@griffel/transform-shaker';

import type { TransformResolver } from './evaluation/module.mjs';
import type { Evaluator, EvalRule, TransformPerfIssue } from './evaluation/types.mjs';
import {
  resolveStyleRulesForSlots,
  resolveResetStyleRules,
  resolveStaticStyleRules,
  type GriffelStyle,
  type GriffelStaticStyles,
  type CSSRulesByBucket,
  type GriffelResetStyle,
} from '@griffel/core';

import { batchEvaluator } from './evaluation/batchEvaluator.mjs';
import { fluentTokensPlugin } from './evaluation/fluentTokensPlugin.mjs';
import type { AstEvaluatorPlugin } from './evaluation/types.mjs';
import { CSS_EXTRACTION_DISABLE_COMMENT } from './constants.mjs';
import { dedupeCSSRules } from './utils/dedupeCSSRules.mjs';
import { generateTransformMetadata, type ProcessedStyleCall } from './generateTransformMetadata.mjs';
import type {
  PrecompiledFunctionKind,
  SourceFunctionKind,
  StyleCall,
  StyleCallKind,
  TransformMetadata,
} from './types.mjs';

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
  importsToTransform?: string[];

  /** Defines the set of function names that should be treated as Griffel style calls. */
  functionsToTransform?: FunctionKinds[];

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

type FunctionKinds = SourceFunctionKind;

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

const RUNTIME_IDENTIFIERS = new Map<StyleCallKind, string>([
  ['makeStyles', '__css'],
  ['makeResetStyles', '__resetCSS'],
  ['makeStaticStyles', '__staticCSS'],

  ['__styles', '__css'],
  ['__resetStyles', '__resetCSS'],
  ['__staticStyles', '__staticCSS'],
]);

/**
 * Positions of an argument containing CSS rules in precompiled calls, it's always the last argument:
 *   __styles(classNamesMapping, cssRules)
 *   __resetStyles(ltrClassName, rtlClassName, cssRules)
 *   __staticStyles(cssRules)
 */
const PRECOMPILED_ARGUMENT_INDEX = new Map<PrecompiledFunctionKind, number>([
  ['__styles', 1],
  ['__resetStyles', 2],
  ['__staticStyles', 0],
]);

/** Names of functions in precompiled code, they are always handled by `transformSync()`. */
export const PRECOMPILED_FUNCTION_NAMES = Array.from(PRECOMPILED_ARGUMENT_INDEX.keys());

/**
 * The marker is only recognized as the first comment of a file to keep it predictable: a mention
 * of it anywhere else (including in a string) does not silently disable the extraction.
 */
function hasCSSExtractionDisableComment(parseResult: ParseResult): boolean {
  return parseResult.comments[0]?.value.trim() === CSS_EXTRACTION_DISABLE_COMMENT;
}

function concatCSSRulesByBucket(bucketA: CSSRulesByBucket = {}, bucketB: CSSRulesByBucket) {
  // eslint-disable-next-line guard-for-in
  for (const cssBucketName in bucketB) {
    const bucketName = cssBucketName as keyof CSSRulesByBucket;
    const bucketBEntries = bucketB[bucketName] ?? [];

    if (bucketA[bucketName]) {
      bucketA[bucketName].push(...bucketBEntries);
    } else {
      // Copy instead of borrowing the reference: later calls push into `bucketA[bucketName]`,
      // which would otherwise mutate the caller's array (and the CSS rules captured for metadata).
      bucketA[bucketName] = [...bucketBEntries];
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
    importsToTransform = ['@griffel/core', '@griffel/react', '@fluentui/react-components'],
    functionsToTransform = ['makeStyles', 'makeResetStyles', 'makeStaticStyles'],
    evaluationRules = [{ action: perfIssues ? wrapWithPerfIssues(shakerEvaluator, perfIssues) : shakerEvaluator }],
    astEvaluationPlugins = [fluentTokensPlugin],
  } = options;

  if (!filename) {
    throw new Error('Transform error: "filename" option is required');
  }

  const importsToTransformSet = new Set(importsToTransform);
  const functionsToTransformSet = new Set<FunctionKinds>(functionsToTransform);

  const parseResult = parseSync(filename, sourceCode);

  if (parseResult.errors.length > 0) {
    throw new Error(`Failed to parse "${filename}": ${parseResult.errors.map(e => e.message).join(', ')}`);
  }

  if (hasCSSExtractionDisableComment(parseResult)) {
    return { code: sourceCode, usedProcessing: false, usedVMForEvaluation: false };
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
  const hasGriffelImports = parseResult.module.staticImports.some(si =>
    si.entries.some(e => {
      if (e.importName.kind !== 'Name') {
        return false;
      }

      // Precompiled calls are matched regardless of "importsToTransform", see the comment in the walk below
      if (PRECOMPILED_ARGUMENT_INDEX.has(e.importName.name as PrecompiledFunctionKind)) {
        return true;
      }

      return (
        importsToTransformSet.has(si.moduleRequest.value) &&
        functionsToTransformSet.has(e.importName.name as FunctionKinds)
      );
    }),
  );

  if (!hasGriffelImports) {
    return { code: sourceCode, usedProcessing: false, usedVMForEvaluation: false };
  }

  const styleCalls: StyleCall[] = [];

  // Per-call metadata inputs, filled by index during processing to preserve source order and
  // consumed by generateTransformMetadata(); one entry per style call.
  const processedStyleCalls: ProcessedStyleCall[] = [];

  let cssRulesByBucket: CSSRulesByBucket = {};

  // -----
  // Walk AST to collect style function calls using ScopeTracker for scope-aware import resolution

  const scopeTracker = new ScopeTracker();
  const matchedSpecifiers = new Map<
    number,
    { start: number; end: number; importStart: number; functionKind: StyleCallKind }
  >();

  walk(programAst, {
    scopeTracker,
    enter(node, parent) {
      if (node.type === 'CallExpression' && node.callee.type === 'Identifier') {
        const declaration = scopeTracker.getDeclaration(node.callee.name) as ScopeTrackerImport | null;

        if (declaration?.type !== 'Import' || declaration.node.type !== 'ImportSpecifier') {
          return;
        }

        const imported = declaration.node.imported;

        if (imported.type !== 'Identifier') {
          return;
        }

        const importedName = imported.name;
        const precompiledArgumentIndex = PRECOMPILED_ARGUMENT_INDEX.get(importedName as PrecompiledFunctionKind);

        // Precompiled calls are matched regardless of "importsToTransform" as these identifiers are internal to
        // Griffel: a package can be precompiled with any set of "importsToTransform" and consumers of that package
        // don't know about it.
        if (precompiledArgumentIndex === undefined) {
          const importSource = declaration.importNode.source.value;

          if (!importsToTransformSet.has(importSource)) {
            return;
          }

          if (!functionsToTransformSet.has(importedName as FunctionKinds)) {
            return;
          }
        }

        const functionKind = importedName as StyleCallKind;

        let argument: Node;
        let argumentStart: number;
        let argumentEnd: number;

        if (precompiledArgumentIndex === undefined) {
          if (node.arguments.length !== 1) {
            throw new Error(
              `${functionKind}() function accepts only a single param, got ${node.arguments.length} in ${filename}`,
            );
          }

          argument = node.arguments[0];
          argumentStart = argument.start;
          argumentEnd = argument.end;
        } else {
          // A call that does not match the shape produced by "@griffel/babel-preset" is left untouched
          if (node.arguments.length !== precompiledArgumentIndex + 1) {
            return;
          }

          argument = node.arguments[precompiledArgumentIndex];

          if (argument.type !== 'ObjectExpression' && argument.type !== 'ArrayExpression') {
            return;
          }

          // The argument is removed, not replaced: the range is extended to the preceding comma and to the closing
          // parenthesis of a call to also drop a trailing comma
          argumentStart =
            precompiledArgumentIndex > 0 ? node.arguments[precompiledArgumentIndex - 1].end : argument.start;
          argumentEnd = node.end - 1;
        }

        // Track the import specifier for rewriting (deduped by node start position)
        matchedSpecifiers.set(declaration.node.start, {
          start: declaration.node.start,
          end: declaration.node.end,
          importStart: declaration.importNode.start,
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

        styleCalls.push({
          declaratorId,
          functionKind,

          argumentStart,
          argumentEnd,
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

  for (let i = styleCalls.length - 1; i >= 0; i--) {
    const styleCall = styleCalls[i];
    const evaluationResult = evaluationResults[i];

    switch (styleCall.functionKind) {
      case 'makeStyles':
        {
          const stylesBySlots = evaluationResult as Record<string, GriffelStyle>;
          const [classnamesMapping, resolvedCSSRules] = resolveStyleRulesForSlots(stylesBySlots, classNameHashSalt);
          const uniqueCSSRules = dedupeCSSRules(resolvedCSSRules);

          if (generateMetadata) {
            processedStyleCalls[i] = {
              styleCall,
              functionKind: 'makeStyles',
              css: { classnamesMapping, resolvedCSSRules },
            };
          }

          // Replace the function call arguments
          magicString.overwrite(styleCall.argumentStart, styleCall.argumentEnd, `${JSON.stringify(classnamesMapping)}`);
          cssRulesByBucket = concatCSSRulesByBucket(cssRulesByBucket, uniqueCSSRules);
        }

        break;

      case 'makeResetStyles':
        {
          const styles = evaluationResult as GriffelResetStyle;
          const [ltrClassName, rtlClassName, cssRules] = resolveResetStyleRules(styles, classNameHashSalt);

          if (generateMetadata) {
            processedStyleCalls[i] = { styleCall, functionKind: 'makeResetStyles', css: cssRules };
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

          if (generateMetadata) {
            processedStyleCalls[i] = { styleCall, functionKind: 'makeStaticStyles' };
          }

          // Replace the function call arguments with the resolved CSS rules bucket
          magicString.overwrite(styleCall.argumentStart, styleCall.argumentEnd, JSON.stringify({ d: cssRules }));
          cssRulesByBucket = concatCSSRulesByBucket(cssRulesByBucket, { d: cssRules });
        }
        break;

      // Precompiled calls already contain resolved CSS rules, they are only collected & stripped
      case '__styles':
      case '__staticStyles':
        {
          const cssRules = evaluationResult as CSSRulesByBucket;

          magicString.remove(styleCall.argumentStart, styleCall.argumentEnd);
          cssRulesByBucket = concatCSSRulesByBucket(cssRulesByBucket, cssRules);
        }
        break;

      case '__resetStyles':
        {
          const cssRules = evaluationResult as CSSRulesByBucket | string[];

          magicString.remove(styleCall.argumentStart, styleCall.argumentEnd);
          cssRulesByBucket = concatCSSRulesByBucket(
            cssRulesByBucket,
            Array.isArray(cssRules) ? { r: cssRules } : cssRules,
          );
        }
        break;
    }
  }

  // ---
  // Transform imports and function names

  const rewrittenSpecifiers = new Set<string>();

  for (const specifier of matchedSpecifiers.values()) {
    const runtimeIdentifier = RUNTIME_IDENTIFIERS.get(specifier.functionKind)!;

    // Multiple functions map to the same runtime identifier ("makeStyles" & "__styles"), rewriting both specifiers
    // in the same import declaration would produce a duplicate binding
    const rewriteKey = `${specifier.importStart}:${runtimeIdentifier}`;

    if (rewrittenSpecifiers.has(rewriteKey)) {
      continue;
    }

    rewrittenSpecifiers.add(rewriteKey);
    magicString.overwrite(specifier.start, specifier.end, runtimeIdentifier);
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
      metadata: generateTransformMetadata({
        source: sourceCode,
        program: programAst,
        comments: parseResult.comments,
        // Precompiled calls produce no metadata, they leave holes in the array
        processedStyleCalls: processedStyleCalls.filter(Boolean),
      }),
    }),
  };
}
