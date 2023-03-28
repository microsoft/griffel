import { NodePath, PluginObj, PluginPass, types as t } from '@babel/core';
import { addNamed } from '@babel/helper-module-imports';
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

function evaluateAndUpdateArgument(
  argumentPath: NodePath<t.ObjectExpression> | NodePath<t.ArrayExpression>,
  functionKind: FunctionKinds,
  state: StripRuntimeBabelPluginState,
) {
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
}

function getFunctionArgumentPath(
  callExpressionPath: NodePath<t.CallExpression>,
  functionKind: FunctionKinds,
): NodePath<t.ObjectExpression> | NodePath<t.ArrayExpression> | null {
  const argumentPaths = callExpressionPath.get('arguments');

  if (functionKind === '__styles') {
    if (argumentPaths.length === 2 && argumentPaths[1].isObjectExpression()) {
      return argumentPaths[1];
    }
  }

  if (functionKind === '__resetStyles') {
    if (argumentPaths.length === 3 && argumentPaths[2].isArrayExpression()) {
      return argumentPaths[2];
    }
  }

  return null;
}

function getReferencePaths(
  specifierPath: NodePath<t.ImportSpecifier>,
  functionKind: FunctionKinds,
): NodePath<t.Node>[] {
  const importedPath = specifierPath.get('imported');

  if (importedPath.isIdentifier({ name: functionKind })) {
    const localPath = specifierPath.get('local');
    const programPath = specifierPath.findParent(p => p.isProgram())!;

    const importBinding = programPath.scope.getBinding(localPath.node.name);

    if (importBinding) {
      return importBinding.referencePaths;
    }
  }

  return [];
}

function inlineAssetImports(argumentPath: NodePath<t.ObjectExpression> | NodePath<t.ArrayExpression>) {
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
}

function updateCalleeName(callExpressionPath: NodePath<t.CallExpression>, importName: string) {
  const calleePath = callExpressionPath.get('callee');

  calleePath.replaceWith(t.identifier(importName));
}

function updateReferences(
  state: StripRuntimeBabelPluginState,
  importSpecifierPath: NodePath<t.ImportSpecifier>,
  importSource: string,
  functionKind: FunctionKinds,
) {
  const importName = functionKind === '__styles' ? '__css' : '__resetCSS';
  const importIdentifier = addNamed(importSpecifierPath, importName, importSource);

  const referencePaths = getReferencePaths(importSpecifierPath, functionKind);

  for (const referencePath of referencePaths) {
    if (referencePath.parentPath?.isCallExpression()) {
      const callExpressionPath = referencePath.parentPath;
      const argumentPath = getFunctionArgumentPath(callExpressionPath, functionKind);

      if (argumentPath) {
        inlineAssetImports(argumentPath);
        evaluateAndUpdateArgument(argumentPath, functionKind, state);

        updateCalleeName(callExpressionPath, importIdentifier.name);
      }
    }
  }
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

              const importSourcePath = (path.parentPath as NodePath<t.ImportDeclaration>).get('source');
              const importSource = importSourcePath.node.value;

              if (importedPath.isIdentifier({ name: '__styles' })) {
                updateReferences(state, path, importSource, '__styles');
              } else if (importedPath.isIdentifier({ name: '__resetStyles' })) {
                updateReferences(state, path, importSource, '__resetStyles');
              }
            },
          });
        },
      },
    },
  };
});
