import type { NodePath, PluginObj, PluginPass } from '@babel/core';
import { types as t } from '@babel/core';
import { declare } from '@babel/helper-plugin-utils';
import { Module } from '@linaria/babel-preset';
import shakerEvaluator from '@linaria/shaker';
import type { GriffelStyle, CSSRulesByBucket, CSSClassesMapBySlot } from '@griffel/core';
import { resolveStyleRulesForSlots, resolveResetStyleRules, normalizeCSSBucketEntry } from '@griffel/core';
import * as path from 'path';

import { normalizeStyleRules } from './assets/normalizeStyleRules';
import { replaceAssetsWithImports } from './assets/replaceAssetsWithImports';
import { dedupeCSSRules } from './utils/dedupeCSSRules';
import { evaluatePaths } from './utils/evaluatePaths';
import type { BabelPluginOptions, BabelPluginMetadata } from './types';
import { validateOptions } from './validateOptions';
import { absolutePathToRelative } from './assets/absolutePathToRelative';
import { tokenize } from 'stylis';
import { isAssetUrl } from './assets/isAssetUrl';

type FunctionKinds = 'makeStyles' | 'makeResetStyles';

type BabelPluginState = PluginPass & {
  importDeclarationPaths?: NodePath<t.ImportDeclaration>[];
  requireDeclarationPath?: NodePath<t.VariableDeclarator>;

  definitionPaths?: {
    /** The name of the resulting hook from a Griffel call */
    declaratorId: string;
    /** The type of Griffel call */
    functionKind: FunctionKinds;
    /** The code path of the Griffel call  */
    path: NodePath<t.Expression | t.SpreadElement>;
  }[];
  calleePaths?: NodePath<t.Identifier>[];
  cssEntries?: BabelPluginMetadata['cssEntries'];
  cssResetEntries?: BabelPluginMetadata['cssResetEntries'];

  cssRulesByBucket?: CSSRulesByBucket;
};

function getDefinitionPathFromCallExpression(
  functionKind: FunctionKinds,
  callExpression: NodePath<t.CallExpression>,
): NodePath<t.Expression | t.SpreadElement> {
  const argumentPaths = callExpression.get('arguments');
  const hasValidArguments = Array.isArray(argumentPaths) && argumentPaths.length === 1;

  if (!hasValidArguments) {
    throw callExpression.buildCodeFrameError(`${functionKind}() function accepts only a single param`);
  }

  const definitionsPath = argumentPaths[0];

  if (definitionsPath.isExpression() || definitionsPath.isSpreadElement()) {
    return definitionsPath;
  }

  throw definitionsPath.buildCodeFrameError(`${functionKind}() function accepts only expressions and spreads`);
}

/**
 * Gets a kind of passed callee.
 */
function getCalleeFunctionKind(
  path: NodePath<t.Identifier>,
  modules: NonNullable<BabelPluginOptions['modules']>,
): FunctionKinds | null {
  for (const module of modules) {
    if (path.referencesImport(module.moduleSource, module.importName)) {
      return 'makeStyles';
    }

    if (path.referencesImport(module.moduleSource, module.resetImportName || 'makeResetStyles')) {
      return 'makeResetStyles';
    }
  }

  return null;
}

/**
 * Gets the id of the parent variable declarator
 */
function getParentDeclaratorId(path: NodePath<t.CallExpression> | NodePath<t.MemberExpression>): string {
  const declarator = path.findParent(p => p.isVariableDeclarator());
  if (declarator?.isVariableDeclarator()) {
    const id = declarator.get('id');
    if (id.isIdentifier()) {
      return id.node.name;
    }
  }

  return 'unknownHook';
}

/**
 * Extracts CSS rules from evaluated reset styles to metadata
 */
function buildCSSResetEntriesMetadata(
  state: Required<BabelPluginState>,
  cssRules: string[] | CSSRulesByBucket,
  declaratorId: string,
) {
  const cssRulesByBucket: CSSRulesByBucket = Array.isArray(cssRules) ? { d: cssRules } : cssRules;
  state.cssResetEntries[declaratorId] ??= [];
  state.cssResetEntries[declaratorId] = Object.values(cssRulesByBucket).flatMap(bucketEntries => {
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
  state: Required<BabelPluginState>,
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

  state.cssEntries[declaratorId] = Object.fromEntries(
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

/**
 * Checks if import statement import makeStyles().
 */
function hasMakeStylesImport(
  path: NodePath<t.ImportDeclaration>,
  modules: NonNullable<BabelPluginOptions['modules']>,
): boolean {
  return Boolean(modules.find(module => path.node.source.value === module.moduleSource));
}

/**
 * Checks that passed declarator imports makesStyles().
 *
 * @example react_make_styles_1 = require('@griffel/react')
 */
function isRequireDeclarator(
  path: NodePath<t.VariableDeclarator>,
  modules: NonNullable<BabelPluginOptions['modules']>,
): boolean {
  const initPath = path.get('init');

  if (!initPath.isCallExpression()) {
    return false;
  }

  if (initPath.get('callee').isIdentifier({ name: 'require' })) {
    const args = initPath.get('arguments');

    if (Array.isArray(args) && args.length === 1) {
      const moduleNamePath = args[0];

      if (moduleNamePath.isStringLiteral()) {
        return Boolean(modules.find(module => moduleNamePath.node.value === module.moduleSource));
      }
    }
  }

  return false;
}

function concatCSSRulesByBucket(bucketA: CSSRulesByBucket = {}, bucketB: CSSRulesByBucket) {
  Object.entries(bucketB).forEach(([cssBucketName, cssBucketEntries]) => {
    bucketA[cssBucketName as keyof CSSRulesByBucket] = cssBucketEntries.concat(
      bucketA[cssBucketName as keyof CSSRulesByBucket] || [],
    );
  });

  return bucketA;
}

function inlineAssetImports({
  cssRulesByBucket,
  importPath,
  filename,
  projectRoot,
}: {
  cssRulesByBucket: CSSRulesByBucket;
  importPath: string;
  filename: string;
  projectRoot: string;
}) {
  Object.entries(cssRulesByBucket).forEach(([cssBucketName, cssBucketEntries]) => {
    cssBucketEntries.forEach((bucketEntry, index) => {
      const [cssRule, metadata] = normalizeCSSBucketEntry(bucketEntry);

      if (cssRule.indexOf('url(') === -1) {
        return;
      }

      const tokens = tokenize(cssRule);
      let newCSSRule = '';

      for (let i = 0, l = tokens.length; i < l; i++) {
        newCSSRule += tokens[i];

        if (tokens[i] === 'url') {
          const url = tokens[i + 1].slice(1, -1);

          if (isAssetUrl(url)) {
            const [pathname, hash] = url.split('#');
            const relativePath = absolutePathToRelative(path, projectRoot, filename, pathname);

            newCSSRule += `(${relativePath}${hash ? `#${hash}` : ''})`;
            i++;
          }
        }
      }

      if (Array.isArray(bucketEntry)) {
        // @ts-expect-error TODO: fix me
        cssRulesByBucket[cssBucketName][index] = [newCSSRule, metadata];
      } else {
        // @ts-expect-error TODO: fix me
        cssRulesByBucket[cssBucketName][index] = newCSSRule;
      }
    });
  });

  return cssRulesByBucket;
}

export const transformPlugin = declare<Partial<BabelPluginOptions>, PluginObj<BabelPluginState>>((api, options) => {
  api.assertVersion(7);

  const pluginOptions: Required<BabelPluginOptions> = {
    babelOptions: {},
    classNameHashSalt: '',
    generateMetadata: false,
    modules: [
      { moduleSource: '@griffel/react', importName: 'makeStyles' },
      { moduleSource: '@fluentui/react-components', importName: 'makeStyles' },
    ],
    evaluationRules: [
      { action: shakerEvaluator },
      {
        test: /[/\\]node_modules[/\\]/,
        action: 'ignore',
      },
    ],
    mode: 'aot',
    projectRoot: process.cwd(),

    ...options,
  };

  validateOptions(pluginOptions);

  return {
    name: '@griffel/babel-plugin-transform',

    pre() {
      this.importDeclarationPaths = [];
      this.definitionPaths = [];
      this.calleePaths = [];
      this.cssEntries = {};
      this.cssResetEntries = {};

      if (pluginOptions.generateMetadata) {
        Object.assign(this.file.metadata, {
          cssResetEntries: {},
          cssEntries: {},
        } as BabelPluginMetadata);
      }
    },
    post() {
      if (pluginOptions.mode === 'css-extraction') {
        Object.assign(this.file.metadata, {
          cssRulesByBucket: inlineAssetImports({
            cssRulesByBucket: this.cssRulesByBucket!,
            importPath: path.relative(this.filename!, pluginOptions.projectRoot),
            filename: this.filename!,
            projectRoot: pluginOptions.projectRoot,
          }),
        } as BabelPluginMetadata);
      }
    },

    visitor: {
      Program: {
        enter(programPath, state) {
          if (typeof state.filename === 'undefined') {
            throw new Error(
              [
                '@griffel/babel-preset: This preset requires "filename" option to be specified by Babel. ',
                "It's automatically done by Babel and our loaders/plugins. ",
                "If you're facing this issue, please check your setup.\n\n",
                'See: https://babeljs.io/docs/en/options#filename',
              ].join(''),
            );
          }

          // Invalidate cache for module evaluation to get fresh modules
          Module.invalidate();
        },

        exit(programPath, state) {
          if (state.importDeclarationPaths!.length === 0 && !state.requireDeclarationPath) {
            return;
          }

          if (state.definitionPaths) {
            // Runs Babel AST processing or module evaluation for Node once for all arguments of makeStyles() calls once
            evaluatePaths(
              programPath,
              state.file.opts.filename!,
              state.definitionPaths.map(p => p.path),
              pluginOptions,
            );

            state.definitionPaths.forEach(definitionPath => {
              const callExpressionPath = definitionPath.path.findParent(parentPath =>
                parentPath.isCallExpression(),
              ) as NodePath<t.CallExpression>;
              const evaluationResult = definitionPath.path.evaluate();

              if (!evaluationResult.confident) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const deoptPath = (evaluationResult as any).deopt as NodePath | undefined;
                throw (deoptPath || definitionPath.path).buildCodeFrameError(
                  'Evaluation of a code fragment failed, this is a bug, please report it',
                );
              }

              if (definitionPath.functionKind === 'makeStyles') {
                const stylesBySlots: Record<string /* slot */, GriffelStyle> = evaluationResult.value;
                const [classnamesMapping, cssRulesByBucket] = resolveStyleRulesForSlots(
                  // Heads up!
                  // Style rules should be normalized *before* they will be resolved to CSS rules to have deterministic
                  // results across different build targets.
                  normalizeStyleRules(
                    path,
                    pluginOptions.projectRoot,
                    // Presence of "state.filename" is validated on `Program.enter()`
                    state.filename as string,
                    stylesBySlots,
                  ),
                  options.classNameHashSalt,
                );
                const uniqueCSSRules = dedupeCSSRules(cssRulesByBucket);

                if (pluginOptions.generateMetadata) {
                  buildCSSEntriesMetadata(
                    state as Required<BabelPluginState>,
                    classnamesMapping,
                    uniqueCSSRules,
                    definitionPath.declaratorId,
                  );
                }

                if (pluginOptions.mode === 'css-extraction') {
                  state.cssRulesByBucket = concatCSSRulesByBucket(state.cssRulesByBucket, cssRulesByBucket);
                }

                (callExpressionPath.get('arguments.0') as NodePath).remove();
                callExpressionPath.pushContainer('arguments', [t.valueToNode(classnamesMapping)]);

                if (pluginOptions.mode === 'aot') {
                  callExpressionPath.pushContainer('arguments', [t.valueToNode(uniqueCSSRules)]);
                }
              }

              if (definitionPath.functionKind === 'makeResetStyles') {
                const styles: GriffelStyle = evaluationResult.value;
                const [ltrClassName, rtlClassName, cssRules] = resolveResetStyleRules(
                  // Heads up!
                  // Style rules should be normalized *before* they will be resolved to CSS rules to have deterministic
                  // results across different build targets.
                  normalizeStyleRules(
                    path,
                    pluginOptions.projectRoot,
                    // Presence of "state.filename" is validated on `Program.enter()`
                    state.filename as string,
                    styles,
                  ),
                  options.classNameHashSalt,
                );

                if (pluginOptions.generateMetadata) {
                  buildCSSResetEntriesMetadata(
                    state as Required<BabelPluginState>,
                    cssRules,
                    definitionPath.declaratorId,
                  );
                }

                if (pluginOptions.mode === 'css-extraction') {
                  state.cssRulesByBucket = concatCSSRulesByBucket(
                    state.cssRulesByBucket,
                    Array.isArray(cssRules) ? { r: cssRules } : cssRules,
                  );
                }

                (callExpressionPath.get('arguments.0') as NodePath).remove();
                callExpressionPath.pushContainer('arguments', [
                  t.valueToNode(ltrClassName),
                  t.valueToNode(rtlClassName),
                ]);

                if (pluginOptions.mode === 'aot') {
                  callExpressionPath.pushContainer('arguments', [t.valueToNode(cssRules)]);
                }
              }

              if (pluginOptions.mode === 'aot') {
                replaceAssetsWithImports(pluginOptions.projectRoot, state.filename!, programPath, callExpressionPath);
              }
            });

            if (pluginOptions.generateMetadata) {
              Object.assign(this.file.metadata, {
                cssResetEntries: state.cssResetEntries ?? {},
                cssEntries: state.cssEntries ?? {},
              } as BabelPluginMetadata);
            }
          }

          state.importDeclarationPaths!.forEach(importDeclarationPath => {
            const specifiers = importDeclarationPath.get('specifiers');
            const source = importDeclarationPath.get('source');

            specifiers.forEach(specifier => {
              if (specifier.isImportSpecifier()) {
                const importedPath = specifier.get('imported');

                for (const module of pluginOptions.modules) {
                  if (module.moduleSource !== source.node.value) {
                    // 👆 "moduleSource" should match "importDeclarationPath.source" to skip unrelated ".importName"
                    continue;
                  }

                  if (importedPath.isIdentifier({ name: module.importName })) {
                    specifier.replaceWith(t.identifier(pluginOptions.mode === 'aot' ? '__styles' : '__css'));
                  } else if (importedPath.isIdentifier({ name: module.resetImportName || 'makeResetStyles' })) {
                    specifier.replaceWith(t.identifier(pluginOptions.mode === 'aot' ? '__resetStyles' : '__resetCSS'));
                  }
                }
              }
            });
          });

          if (state.calleePaths) {
            state.calleePaths.forEach(calleePath => {
              if (calleePath.node.name === 'makeResetStyles') {
                calleePath.replaceWith(t.identifier(pluginOptions.mode === 'aot' ? '__resetStyles' : '__resetCSS'));
                return;
              }

              calleePath.replaceWith(t.identifier(pluginOptions.mode === 'aot' ? '__styles' : '__css'));
            });
          }
        },
      },

      // eslint-disable-next-line @typescript-eslint/naming-convention
      ImportDeclaration(path, state) {
        if (hasMakeStylesImport(path, pluginOptions.modules)) {
          state.importDeclarationPaths!.push(path);
        }
      },

      // eslint-disable-next-line @typescript-eslint/naming-convention
      VariableDeclarator(path, state) {
        if (isRequireDeclarator(path, pluginOptions.modules)) {
          state.requireDeclarationPath = path;
        }
      },

      // eslint-disable-next-line @typescript-eslint/naming-convention
      CallExpression(path, state) {
        /**
         * Handles case when `makeStyles()` is `CallExpression`.
         *
         * @example makeStyles({})
         */
        if (state.importDeclarationPaths!.length === 0) {
          return;
        }

        const calleePath = path.get('callee');

        if (calleePath.isIdentifier()) {
          const functionKind = getCalleeFunctionKind(calleePath, pluginOptions.modules);
          const declaratorId = getParentDeclaratorId(path);

          if (functionKind) {
            state.definitionPaths!.push({
              declaratorId,
              functionKind,
              path: getDefinitionPathFromCallExpression(functionKind, path),
            });
            state.calleePaths!.push(calleePath);
          }
        }
      },

      // eslint-disable-next-line @typescript-eslint/naming-convention
      MemberExpression(expressionPath, state) {
        /**
         * Handles case when `makeStyles()` is inside `MemberExpression`.
         *
         * @example module.makeStyles({})
         */
        if (!state.requireDeclarationPath) {
          return;
        }

        const objectPath = expressionPath.get('object');
        const propertyPath = expressionPath.get('property');

        if (!objectPath.isIdentifier({ name: (state.requireDeclarationPath.node.id as t.Identifier).name })) {
          return;
        }

        let functionKind: FunctionKinds | null = null;

        if (propertyPath.isIdentifier({ name: 'makeStyles' })) {
          functionKind = 'makeStyles';
        } else if (propertyPath.isIdentifier({ name: 'makeResetStyles' })) {
          functionKind = 'makeResetStyles';
        }

        if (!functionKind) {
          return;
        }

        const parentPath = expressionPath.parentPath;

        if (!parentPath.isCallExpression()) {
          return;
        }

        const declaratorId = getParentDeclaratorId(expressionPath);
        state.definitionPaths!.push({
          functionKind,
          declaratorId,
          path: getDefinitionPathFromCallExpression(functionKind, parentPath),
        });
        state.calleePaths!.push(propertyPath as NodePath<t.Identifier>);
      },
    },
  };
});
