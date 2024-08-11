import { ESLintUtils } from '@typescript-eslint/utils';

import { isMakeStylesCallExpression, isMakeStylesImport } from '../utils/helpers';
import { getDocsUrl } from '../utils/getDocsUrl';

const STYLES_FILE_PATTERN = /^.*\.(styles)\.[j|t]s$/;

function isStylesFile(fileName: string) {
  return STYLES_FILE_PATTERN.test(fileName);
}

export const RULE_NAME = 'styles-file';

export const stylesFileRule = ESLintUtils.RuleCreator(getDocsUrl)({
  name: RULE_NAME,
  meta: {
    docs: {
      description: 'Enforce that hooks returned from makeStyles() calls are placed in a .styles.ts file',
      recommended: 'recommended',
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
