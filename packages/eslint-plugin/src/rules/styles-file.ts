import { createRule } from '../utils/createRule';
import type { ESLintUtils, TSESTree } from '@typescript-eslint/utils';
import { isMakeStylesCallExpression } from '../utils/helpers';

const MATCHING_PACKAGES = new Set(['@fluentui/react-components', '@griffel/core', '@griffel/react']);
const STYLES_FILE_PATTERN = /^.*\.(styles)\.[j|t]s$/;

function isMatchingPackage(packageName: string) {
  return MATCHING_PACKAGES.has(packageName);
}

function isStylesFile(fileName: string) {
  return STYLES_FILE_PATTERN.test(fileName);
}

/**
 * @param node - import node from AST
 * @returns true if makeStyles is imported, or if the entire library is imported. Otherwise returns false
 */
function isMakeStylesImport(node: TSESTree.ImportDeclaration) {
  return (
    isMatchingPackage(node.source.value) &&
    node.specifiers.filter(specifier => {
      // import * as ... from
      if (specifier.type === 'ImportNamespaceSpecifier') {
        return true;
      }

      if ('imported' in specifier) {
        return (
          specifier.imported.name === 'makeStyles' || // import { makeStyles } from
          specifier.imported.name === 'makeStaticStyles' || // import { makeStaticStyles } from
          specifier.imported.name === 'makeResetStyles' // import { makeResetStyles } from
        );
      }

      return false;
    }).length > 0
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
    const makeStylesDeclarations: string[] = []; // contains constants from makeStyles calls: `const useStyles = makeStyles({})`

    return {
      ImportDeclaration(node) {
        if (!isMakeStylesImported) {
          isMakeStylesImported = isMakeStylesImport(node);
        }
      },
      CallExpression(node) {
        if (
          isMakeStylesImported &&
          isMakeStylesCallExpression(node, 'makeStyles', 'makeStaticStyles', 'makeResetStyles')
        ) {
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
              isMakeStylesCallExpression(declaration.init, 'makeStyles', 'makeStaticStyles', 'makeResetStyles')
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
