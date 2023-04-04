import { createRule } from '../utils/createRule';
import { ESLintUtils, TSESTree } from '@typescript-eslint/utils';

const fluentLibraries = new Set([
  '@fluentui/react-components',
  '@fluentui/react-icons',
  '@fluentui/react-shared-contexts',
  '@fluentui/react-tabster',
  '@fluentui/react-conformance',
  '@fluentui/react-utilities',
  '@griffel/core',
  '@griffel/react',
]);

/**
 * @param libName name of a library
 * @returns true if the library is a fluent ui v9 library, or its tmp re-export component
 */
function isFluentuiLib(libName: string) {
  return fluentLibraries.has(libName);
}

const stylesFilePattern = /^.*\.(styles)\.ts$/;

/**
 * @param fileName
 * @returns check if a file name follows v9 styles file name convention
 */
function isStylesFile(fileName: string) {
  return stylesFilePattern.test(fileName);
}

/**
 * @param node - import node from AST
 * @returns true if makeStyles is imported, or if the entire library is imported. Otherwise returns false
 */
function isMakeStylesImport(node: TSESTree.ImportDeclaration) {
  if (
    isFluentuiLib(node.source.value) &&
    node.specifiers.filter(specifier => {
      // import * as ... from
      if (specifier.type === 'ImportNamespaceSpecifier') {
        return true;
      }

      if ('imported' in specifier) {
        return (
          specifier.imported.name === 'makeStyles' || // import { makeStyles } from
          specifier.imported.name === 'makeResetStyles' // import { makeResetStyles } from
        );
      }

      return false;
    }).length > 0
  ) {
    return true;
  }
  return false;
}

/**
 * @param callExpression CallExpression node in AST
 * @returns if this is a makeStyles call or not
 */
function isMakeStyleCallExpression({ callee }: TSESTree.CallExpression) {
  return (
    ('name' in callee && callee.name === 'makeStyles') || // makeStyles({})
    ('property' in callee && 'name' in callee.property && callee.property.name === 'makeStyles') // something.makeStyles({})
  );
}

export const RULE_NAME = 'styles-file';

export const stylesFileRule: ReturnType<ReturnType<typeof ESLintUtils.RuleCreator>> = createRule({
  name: RULE_NAME,
  meta: {
    docs: {
      description: 'Enforce that hooks returned from makeStyles() calls are placed in a .styles.ts file',
      recommended: 'error',
    },
    messages: {
      foundMakeStylesUsage:
        'Styles created from `makeStyles` should be defined in a .styles.ts file so they can be extracted into static CSS',
    },
    type: 'problem',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const fileName = context.getFilename();

    let isMakeStylesImported = false;

    const makeStylesDeclarations = []; // contains constants from makeStyles calls: `const useStyles = makeStyles({})`

    return {
      ImportDeclaration(node) {
        if (!isMakeStylesImported) {
          isMakeStylesImported = isMakeStylesImport(node);
        }
      },
      CallExpression(node) {
        if (isMakeStylesImported && isMakeStyleCallExpression(node)) {
          if (!isStylesFile(fileName)) {
            context.report({
              messageId: 'foundMakeStylesUsage',
              node,
            });
          }
        }
      },
      VariableDeclaration(node) {
        if (isStylesFile(fileName)) {
          node.declarations?.forEach(declaration => {
            if (
              isMakeStylesImported &&
              declaration.init?.type === 'CallExpression' &&
              isMakeStyleCallExpression(declaration.init)
            ) {
              if (declaration.id.type === 'Identifier') {
                makeStylesDeclarations.push(declaration.id.name);
              }
            }
          });
        }
      },
    };
  },
});
