import { ESLintUtils } from '@typescript-eslint/utils';

import { getDocsUrl } from '../utils/getDocsUrl';
import { isIdentifier, isMakeStylesCallExpression } from '../utils/helpers';

export const RULE_NAME = 'hook-naming';

export const hookNamingRule = ESLintUtils.RuleCreator(getDocsUrl)({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce that hooks returned from makeStyles() calls are named with a "use" prefix',
      recommended: 'recommended',
    },
    messages: {
      invalidMakeStylesHookNameFound: '`makeStyles` returns a hook. Hooks must start with the prefix `use`',
    },
    schema: [
      {
        type: 'string',
      },
    ],
  },
  defaultOptions: [],

  create(context) {
    return {
      VariableDeclarator(node) {
        if (
          node.init !== null &&
          node.init.type === 'CallExpression' &&
          isMakeStylesCallExpression(node.init, 'makeStyles', 'makeStaticStyles', 'makeResetStyles')
        ) {
          const { id } = node;
          if (isIdentifier(id) && !id.name.startsWith('use')) {
            context.report({
              node: id,
              messageId: 'invalidMakeStylesHookNameFound',
            });
          }
        }
      },
    };
  },
});
