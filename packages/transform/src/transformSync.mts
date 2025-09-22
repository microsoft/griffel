import { parseSync, type Node } from 'oxc-parser';
import { walk } from 'oxc-walker';
import MagicString from 'magic-string';
import { type Evaluator, type StrictOptions } from '@linaria/babel-preset';
import _shaker from '@linaria/shaker';
import {
  resolveStyleRulesForSlots,
  resolveResetStyleRules,
  normalizeCSSBucketEntry,
  type GriffelStyle,
  type CSSRulesByBucket,
  type CSSClassesMapBySlot,
  type GriffelResetStyle,
} from '@griffel/core';

import { batchEvaluator } from './evaluation/batchEvaluator.mjs';
import { dedupeCSSRules } from './utils/dedupeCSSRules.mjs';
import type { StyleCall } from './types.mjs';

const shakerEvaluator = (_shaker.default || _shaker) as unknown as Evaluator;

export type TransformOptions = {
  filename: string;

  classNameHashSalt?: string;

  /**
   * Returns the evaluated CSS rules in the file result metadata
   * @default false
   */
  generateMetadata?: boolean;

  /** Defines set of modules and imports handled by a transformPlugin. */
  modules?: string[];

  /**
   * If you need to specify custom Babel configuration, you can pass them here. These options will be used by the
   * transformPlugin when parsing and evaluating modules.
   */
  babelOptions?: Pick<StrictOptions['babelOptions'], 'plugins' | 'presets'>;

  /** The set of rules that defines how the matched files will be transformed during the evaluation. */
  evaluationRules?: StrictOptions['rules'];
};

export type TransformResult = {
  code: string;
  cssRulesByBucket?: CSSRulesByBucket;
  usedProcessing: boolean;
  usedVMForEvaluation: boolean;
};

type FunctionKinds = 'makeStyles' | 'makeResetStyles';

interface ImportInfo {
  source: string;
  specifiers: Array<{
    imported: string;
    local: string;
    start: number;
    end: number;
  }>;
  start: number;
  end: number;
}

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
  Object.entries(bucketB).forEach(([cssBucketName, cssBucketEntries]) => {
    bucketA[cssBucketName as keyof CSSRulesByBucket] = cssBucketEntries.concat(
      bucketA[cssBucketName as keyof CSSRulesByBucket] || [],
    );
  });

  return bucketA;
}

/**
 * Transforms passed source code with oxc-parser and oxc-walker instead of Babel.
 */
export function transformSync(sourceCode: string, options: TransformOptions): TransformResult {
  const {
    babelOptions = {},
    filename,
    classNameHashSalt = '',
    generateMetadata = false,
    modules = ['@griffel/core', '@griffel/react', '@fluentui/react-components'],
    evaluationRules = [
      { action: shakerEvaluator },
      {
        test: /[/\\]node_modules[/\\]/,
        action: 'ignore',
      },
    ],
  } = options;

  if (!filename) {
    throw new Error('Transform error: "filename" option is required');
  }

  const parseResult = parseSync(filename, sourceCode);
  parseResult.module.staticImports; // TODO use it over imports collected manually

  if (parseResult.errors.length > 0) {
    throw new Error(`Failed to parse "${filename}": ${parseResult.errors.map(e => e.message).join(', ')}`);
  }

  const magicString = new MagicString(sourceCode);
  const programAst = parseResult.program;

  const imports: ImportInfo[] = [];
  const styleCalls: StyleCall[] = [];
  const cssEntries: Record<string, Record<string, string[]>> = {};
  const cssResetEntries: Record<string, string[]> = {};

  let cssRulesByBucket: CSSRulesByBucket = {};

  // -----
  // First pass: collect imports and style function calls

  walk(programAst, {
    enter(node, parent) {
      // Handle import declarations
      if (node.type === 'ImportDeclaration') {
        const moduleSource = node.source.value;

        if (modules.includes(moduleSource)) {
          const specifiers = node.specifiers.reduce<
            {
              imported: string;
              local: string;
              start: number;
              end: number;
            }[]
          >((acc, spec) => {
            if (spec.type === 'ImportSpecifier') {
              const importedName = spec.imported;

              if (
                importedName.type === 'Identifier' &&
                (importedName.name === 'makeStyles' || importedName.name === 'makeResetStyles')
              ) {
                acc.push({
                  imported: importedName.name,
                  local: spec.local.name,
                  start: spec.start,
                  end: spec.end,
                });
              }
            }

            return acc;
          }, []);

          if (specifiers.length > 0) {
            imports.push({
              source: moduleSource,
              specifiers,
              start: node.start,
              end: node.end,
            });
          }
        }
      }

      // Handle call expressions
      if (node.type === 'CallExpression') {
        let functionKind: FunctionKinds | null = null;
        let importId: string | undefined;

        if (node.callee.type === 'Identifier') {
          const calleeName = node.callee.name;

          // Find which import this refers to
          for (const importInfo of imports) {
            const specifier = importInfo.specifiers.find(s => s.local === calleeName);

            if (specifier) {
              if (node.arguments.length !== 1) {
                throw new Error(`${functionKind}() function accepts only a single param`);
              }

              functionKind = specifier.imported as FunctionKinds;
              importId = specifier.local;

              break;
            }
          }
        }

        if (functionKind && importId) {
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

            importId,
          });
        }
      }
    },
  });

  // If no relevant imports or calls found, return original code
  if (imports.length === 0 || styleCalls.length === 0) {
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
    babelOptions,
    evaluationRules,
  );

  for (let i = 0; i < styleCalls.length; i++) {
    const styleCall = styleCalls[i];
    const evaluationResult = evaluationResults[i];

    switch (styleCall.functionKind) {
      case 'makeStyles':
        {
          const stylesBySlots = evaluationResult as Record<string, GriffelStyle>;
          // TODO fix naming
          const [classnamesMapping, cssRulesByBucketA] = resolveStyleRulesForSlots(stylesBySlots, classNameHashSalt);

          if (generateMetadata) {
            buildCSSEntriesMetadata(
              cssEntries,
              classnamesMapping,
              dedupeCSSRules(cssRulesByBucket),
              styleCall.declaratorId,
            );
          }

          // Replace the function call arguments
          magicString.overwrite(styleCall.argumentStart, styleCall.argumentEnd, `${JSON.stringify(classnamesMapping)}`);
          cssRulesByBucket = concatCSSRulesByBucket(cssRulesByBucket, cssRulesByBucketA);
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
    }
  }

  // ---
  // Transform imports and function names

  for (const importInfo of imports) {
    for (const specifier of importInfo.specifiers) {
      if (specifier.imported === 'makeStyles') {
        // TODO: use mapping for identifiers
        magicString.overwrite(specifier.start, specifier.end, '__css');
      } else if (specifier.imported === 'makeResetStyles') {
        magicString.overwrite(specifier.start, specifier.end, '__resetCSS');
      }
    }
  }

  // ---
  // Transform function call names

  for (const styleCall of styleCalls) {
    magicString.overwrite(
      styleCall.callStart,
      styleCall.callStart + styleCall.importId.length,
      '__' + (styleCall.functionKind === 'makeStyles' ? 'css' : 'resetCSS'),
    );
  }

  return {
    code: magicString.toString(),
    cssRulesByBucket,
    usedProcessing: true,
    usedVMForEvaluation,
  };
}
