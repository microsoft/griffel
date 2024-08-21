import { ESLintUtils } from '@typescript-eslint/utils';

import { getMakeStylesCallExpression, isMakeStylesImport } from '../utils/helpers';
import { getDocsUrl } from '../utils/getDocsUrl';

export const RULE_NAME = 'top-level-styles';

export const stylesFileRule = ESLintUtils.RuleCreator(getDocsUrl)({
  name: RULE_NAME,
  meta: {
    docs: {
      description:
        'Ensure makeStyles(), makeResetStyles() and makeStaticStyles() calls are placed in the top level of the file',
      recommended: 'recommended',
    },
    messages: {
      foundInvalidUsage: '`{{ methodName }}` should be only be called from the top-level of the file',
    },
    type: 'problem',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    let isMakeStylesImported = false;

    return {
      ImportDeclaration(node) {
        if (!isMakeStylesImported) {
          isMakeStylesImported = isMakeStylesImport(node);
        }
      },

      'FunctionDeclaration CallExpression, ArrowFunctionExpression CallExpression, FunctionExpression CallExpression':
        function (node) {
          if (!isMakeStylesImported) {
            return;
          }
          const methodName = getMakeStylesCallExpression(node, 'makeStyles', 'makeStaticStyles', 'makeResetStyles');
          if (methodName) {
            context.report({
              messageId: 'foundInvalidUsage',
              data: {
                methodName,
              },
              node,
            });
          }
        },
    };
  },
});
