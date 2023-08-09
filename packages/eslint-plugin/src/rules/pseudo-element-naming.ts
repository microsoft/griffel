import { ESLintUtils, TSESTree } from '@typescript-eslint/utils';

import { createRule } from '../utils/createRule';
import { isStringLiteral, isMakeStylesIdentifier, isObjectExpression, isProperty } from '../utils/helpers';

export const RULE_NAME = 'pseudo-element-naming';

const UNSUPPORTED_PSEUDO_ELEMENTS: Record<string, true> = {
  ':before': true,
  ':after': true,
};

function findPseudoElementProperties(
  node: TSESTree.ObjectExpression,
  isRoot = false,
  result: TSESTree.StringLiteral[] = [],
): TSESTree.StringLiteral[] {
  for (const propertyNode of node.properties) {
    if (isProperty(propertyNode)) {
      if (isStringLiteral(propertyNode.key) && !isRoot) {
        if (Object.prototype.hasOwnProperty.call(UNSUPPORTED_PSEUDO_ELEMENTS, propertyNode.key.value)) {
          result.push(propertyNode.key);
        }
      }

      if (isObjectExpression(propertyNode.value)) {
        findPseudoElementProperties(propertyNode.value, false, result);
      }
    }
  }

  return result;
}

export const pseudoElementNamingRule: ReturnType<ReturnType<typeof ESLintUtils.RuleCreator>> = createRule({
  name: RULE_NAME,
  meta: {
    fixable: 'code',
    type: 'problem',
    docs: {
      description: 'Enforce that Pseudo elements start with two colons (::) instead of one colon (:)',
      recommended: 'error',
    },
    messages: {
      invalidPseudoElementNameFound: 'Pseudo elements must start with two colons (::)',
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
      CallExpression(node) {
        if (isMakeStylesIdentifier(node.callee)) {
          const argument = node.arguments[0];

          if (isObjectExpression(argument)) {
            const pseudoElementProperties = findPseudoElementProperties(argument, true);

            pseudoElementProperties.forEach(pseudoElementProperty => {
              context.report({
                node: pseudoElementProperty,
                messageId: 'invalidPseudoElementNameFound',
                fix: function (fixer) {
                  const start = pseudoElementProperty.range[0] + 1;
                  const end = pseudoElementProperty.range[1];
                  return fixer.insertTextBeforeRange([start, end], ':');
                },
              });
            });
          }
        }
      },
    };
  },
});
