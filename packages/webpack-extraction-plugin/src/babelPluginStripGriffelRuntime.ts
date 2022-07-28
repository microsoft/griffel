import { NodePath, PluginObj, PluginPass, types as t } from '@babel/core';
import { declare } from '@babel/helper-plugin-utils';
import { CSSRulesByBucket, normalizeCSSBucketEntry } from '@griffel/core';
import * as path from 'path';
import template from '@babel/template';

const virtualLoaderPath = '@griffel/webpack-extraction-plugin/virtual-loader/index.js';
const resourcePath = '@griffel/webpack-extraction-plugin/virtual-loader/griffel.css';

type StripRuntimeBabelPluginOptions = {
  /** A directory that contains fake .css file used for CSS extraction */
  resourceDirectory?: string;
};

type StripRuntimeBabelPluginState = PluginPass & {
  cssRules?: string[];
};

export type StripRuntimeBabelPluginMetadata = {
  cssRules: string[];
};

export function transformUrl(filename: string, resourceDirectory: string, assetPath: string) {
  // Get the absolute path to the asset from the path relative to the JS file
  const absoluteAssetPath = path.resolve(path.dirname(filename), assetPath);

  // Replace asset path with new path relative to the output CSS
  return path.relative(resourceDirectory, absoluteAssetPath);
}

/**
 * Escapes a CSS rule to be a valid query param.
 * Also escapes escalamation marks (!) to not confuse webpack.
 *
 * @param rule
 * @returns
 */
export const toURIComponent = (rule: string): string => {
  const component = encodeURIComponent(rule).replace(/!/g, '%21');

  return component;
};

export const babelPluginStripGriffelRuntime = declare<
  Partial<StripRuntimeBabelPluginOptions>,
  PluginObj<StripRuntimeBabelPluginState>
>((api, options) => {
  api.assertVersion(7);

  return {
    name: '@griffel/webpack-extraction-plugin/babel',
    pre() {
      this.cssRules = [];
    },
    post() {
      (this.file.metadata as unknown as StripRuntimeBabelPluginMetadata).cssRules = this.cssRules!;
    },

    visitor: {
      Program: {
        enter(path, state) {
          if (typeof options.resourceDirectory === 'undefined') {
            throw new Error(
              [
                '@griffel/webpack-extraction-plugin: This plugin requires "resourceDirectory" option to be specified. ',
                "It's automatically done by our loaders. ",
                "If you're facing this issue, please check your setup.\n\n",
                'See: https://babeljs.io/docs/en/options#filename',
              ].join(''),
            );
          }

          if (typeof state.filename === 'undefined') {
            throw new Error(
              [
                '@griffel/webpack-extraction-plugin: This plugin requires "filename" option to be specified by Babel. ',
                "It's automatically done by our loaders. ",
                "If you're facing this issue, please check your setup.\n\n",
                'See: https://babeljs.io/docs/en/options#filename',
              ].join(''),
            );
          }
        },
        exit(path, state) {
          path.traverse({
            ImportSpecifier(path) {
              const importedPath = path.get('imported');

              if (!importedPath.isIdentifier({ name: '__styles' })) {
                return;
              }

              const declarationPath = path.findParent(p =>
                p.isImportDeclaration(),
              ) as NodePath<t.ImportDeclaration> | null;

              if (declarationPath === null) {
                throw path.buildCodeFrameError(
                  [
                    'Failed to find "ImportDeclaration" path for an "ImportSpecifier".',
                    'Please report a bug (https://github.com/microsoft/griffel/issues) if this error happens',
                  ].join(' '),
                );
              }

              declarationPath.pushContainer('specifiers', t.identifier('__css'));
            },

            /**
             * Visits all call expressions (__styles function calls):
             * - replaces "__styles" calls "__css"
             * - removes CSS rules from "__styles" calls
             */
            CallExpression(path) {
              const calleePath = path.get('callee');

              if (!calleePath.isIdentifier({ name: '__styles' })) {
                return;
              }

              calleePath.replaceWith(t.identifier('__css'));

              const argumentPaths = path.get('arguments');

              if (argumentPaths.length !== 2) {
                throw calleePath.buildCodeFrameError(
                  [
                    '"__styles" function call should have exactly two arguments.',
                    'Please report a bug (https://github.com/microsoft/griffel/issues) if this error happens',
                  ].join(' '),
                );
              }

              argumentPaths[1].traverse({
                TemplateLiteral(literalPath) {
                  const expressionPath = literalPath.get('expressions.0');

                  if (Array.isArray(expressionPath) || !expressionPath.isIdentifier()) {
                    throw literalPath.buildCodeFrameError(
                      [
                        'A template literal with an imported asset should contain an expression statement.',
                        'Please report a bug (https://github.com/microsoft/griffel/issues) if this error happens',
                      ].join(' '),
                    );
                  }

                  const expressionName = expressionPath.node.name;
                  const expressionBinding = literalPath.scope.getBinding(expressionName);

                  if (typeof expressionBinding === 'undefined') {
                    throw expressionPath.buildCodeFrameError(
                      [
                        'Failed to resolve a binding in a scope for an identifier.',
                        'Please report a bug (https://github.com/microsoft/griffel/issues) if this error happens',
                      ].join(' '),
                    );
                  }

                  const importDeclarationPath = expressionBinding.path.findParent(p =>
                    p.isImportDeclaration(),
                  ) as NodePath<t.ImportDeclaration> | null;

                  if (importDeclarationPath === null) {
                    throw expressionBinding.path.buildCodeFrameError(
                      [
                        'Failed to resolve an import for the identifier.',
                        'Please report a bug (https://github.com/microsoft/griffel/issues) if this error happens',
                      ].join(' '),
                    );
                  }

                  expressionPath.replaceWith(
                    t.stringLiteral(
                      // When imports are inlined, we need to adjust the relative paths inside url(..) expressions
                      // to allow css-loader resolve an imported asset properly
                      transformUrl(
                        state.filename!,
                        options.resourceDirectory!,
                        importDeclarationPath.get('source').node.value,
                      ),
                    ),
                  );
                  importDeclarationPath.remove();
                },
              });

              // Returns the styles as a JavaScript object
              const evaluationResult = argumentPaths[1].evaluate();

              if (!evaluationResult.confident) {
                throw argumentPaths[1].buildCodeFrameError(
                  [
                    'Failed to evaluate CSS rules from "__styles" call.',
                    'Please report a bug (https://github.com/microsoft/griffel/issues) if this error happens',
                  ].join(' '),
                );
              }

              const cssRulesByBucket = evaluationResult.value as CSSRulesByBucket;

              Object.values(cssRulesByBucket).forEach(cssBucketEntries => {
                const cssRules = cssBucketEntries.map(cssBucketEntry => {
                  const [cssRule] = normalizeCSSBucketEntry(cssBucketEntry);

                  return cssRule;
                });

                state.cssRules!.push(...cssRules);
              });

              argumentPaths[1].remove();
            },
          });

          // Each found atomic rule will create a new import that uses the styleSheetPath provided.
          // The benefit is two fold:
          // (1) thread safe collection of styles
          // (2) caching -- resulting in faster builds (one import per rule!)
          const params = toURIComponent(state?.cssRules?.join('\n') || '');
          path.pushContainer('body', template.ast(`import "${virtualLoaderPath}!${resourcePath}?style=${params}";`));
        },
      },
    },
  };
});
