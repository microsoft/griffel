import { NodePath, PluginObj, PluginPass, types as t } from '@babel/core';
import { declare } from '@babel/helper-plugin-utils';
import type { CSSRulesByBucket } from '@griffel/core';

type StripRuntimeBabelPluginOptions = Record<string, unknown>;

type FunctionKinds = '__styles' | '__resetStyles';

type StripRuntimeBabelPluginState = PluginPass & {
  cssRulesByBucket?: CSSRulesByBucket;
};

export type StripRuntimeBabelPluginMetadata = {
  cssRulesByBucket?: CSSRulesByBucket;
};

function concatCSSRulesByBucket(bucketA: CSSRulesByBucket = {}, bucketB: CSSRulesByBucket) {
  Object.entries(bucketB).forEach(([cssBucketName, cssBucketEntries]) => {
    bucketA[cssBucketName as keyof CSSRulesByBucket] = cssBucketEntries.concat(
      bucketA[cssBucketName as keyof CSSRulesByBucket] || [],
    );
  });

  return bucketA;
}

export const babelPluginStripGriffelRuntime = declare<
  Partial<StripRuntimeBabelPluginOptions>,
  PluginObj<StripRuntimeBabelPluginState>
>(api => {
  api.assertVersion(7);

  return {
    name: '@griffel/webpack-extraction-plugin/babel',
    post() {
      (this.file.metadata as unknown as StripRuntimeBabelPluginMetadata).cssRulesByBucket = this.cssRulesByBucket;
    },

    visitor: {
      Program: {
        enter(path, state) {
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
              let functionKind: FunctionKinds;

              if (importedPath.isIdentifier({ name: '__styles' })) {
                functionKind = '__styles';
              } else if (importedPath.isIdentifier({ name: '__resetStyles' })) {
                functionKind = '__resetStyles';
              } else {
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

              if (functionKind === '__styles') {
                declarationPath.pushContainer('specifiers', t.identifier('__css'));
              }

              if (functionKind === '__resetStyles') {
                declarationPath.pushContainer('specifiers', t.identifier('__resetCSS'));
              }
            },

            /**
             * Visits all call expressions (__styles function calls):
             * - replaces "__styles" calls "__css"
             * - removes CSS rules from "__styles" calls
             */
            CallExpression(path) {
              const calleePath = path.get('callee');
              const argumentPaths = path.get('arguments');

              let argumentPath: typeof argumentPaths[number];
              let functionKind: FunctionKinds;

              if (calleePath.isIdentifier({ name: '__styles' })) {
                argumentPath = argumentPaths[1];
                functionKind = '__styles';

                calleePath.replaceWith(t.identifier('__css'));
              } else if (calleePath.isIdentifier({ name: '__resetStyles' })) {
                argumentPath = argumentPaths[2];
                functionKind = '__resetStyles';

                calleePath.replaceWith(t.identifier('__resetCSS'));
              } else {
                return;
              }

              if (
                (functionKind === '__styles' && argumentPaths.length !== 2) ||
                (functionKind === '__resetStyles' && argumentPaths.length !== 3)
              ) {
                throw calleePath.buildCodeFrameError(
                  [
                    `"${functionKind}" function call should have exactly ${argumentPaths.length} arguments.`,
                    'Please report a bug (https://github.com/microsoft/griffel/issues) if this error happens',
                  ].join(' '),
                );
              }

              argumentPath.traverse({
                TemplateLiteral(literalPath) {
                  const expressionPaths = literalPath.get('expressions');

                  expressionPaths.map(expressionPath => {
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

                    expressionPath.replaceWith(t.stringLiteral(importDeclarationPath.get('source').node.value));
                    importDeclarationPath.remove();
                  });
                },
              });

              // Returns the styles as a JavaScript object
              const evaluationResult = argumentPath.evaluate();

              if (!evaluationResult.confident) {
                throw argumentPath.buildCodeFrameError(
                  [
                    `Failed to evaluate CSS rules from "${functionKind}" call.`,
                    'Please report a bug (https://github.com/microsoft/griffel/issues) if this error happens',
                  ].join(' '),
                );
              }

              if (functionKind === '__styles') {
                const cssRulesByBucket = evaluationResult.value as CSSRulesByBucket;

                state.cssRulesByBucket = concatCSSRulesByBucket(state.cssRulesByBucket, cssRulesByBucket);
              } else if (functionKind === '__resetStyles') {
                const cssRules = evaluationResult.value as NonNullable<CSSRulesByBucket['r']>;

                state.cssRulesByBucket = concatCSSRulesByBucket(state.cssRulesByBucket, { r: cssRules });
              }

              argumentPath.remove();
            },
          });
        },
      },
    },
  };
});
