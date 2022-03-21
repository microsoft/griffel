import { NodePath, PluginObj, PluginPass, types as t } from '@babel/core';
import { declare } from '@babel/helper-plugin-utils';
import type { CSSRulesByBucket } from '@griffel/core';

type StripRuntimeBabelPluginOptions = never;

type StripRuntimeBabelPluginState = PluginPass & {
  cssRules?: string[];
};

export type StripRuntimeBabelPluginMetadata = {
  cssRules: string[];
};

export const babelPluginStripGriffelRuntime = declare<
  Partial<StripRuntimeBabelPluginOptions>,
  PluginObj<StripRuntimeBabelPluginState>
>(api => {
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

              Object.values(cssRulesByBucket).forEach(cssRules => {
                state.cssRules!.push(...cssRules);
              });

              argumentPaths[1].remove();
            },
          });
        },
      },
    },
  };
});
