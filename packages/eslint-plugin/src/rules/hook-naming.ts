import type { ESLintUtils } from '@typescript-eslint/utils';

import { createRule } from '../utils/createRule';
import { isIdentifier, isMakeStylesCallExpression } from '../utils/helpers';

export const RULE_NAME = 'hook-naming';

export const hookNamingRule: ReturnType<ReturnType<typeof ESLintUtils.RuleCreator>> = createRule({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce that hooks returned from makeStyles() calls are named with a "use" prefix',
      recommended: 'error',
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
