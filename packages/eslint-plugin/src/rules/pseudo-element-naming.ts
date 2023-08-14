import { ESLintUtils, TSESTree } from '@typescript-eslint/utils';

import { createRule } from '../utils/createRule';
import { isStringLiteral, isMakeStylesIdentifier, isObjectExpression, isProperty } from '../utils/helpers';

export const RULE_NAME = 'pseudo-element-naming';

const PSEUDO_ELEMENTS = [':before', ':after'];

function findInvalidPseudoElementProperties(
  node: TSESTree.ObjectExpression,
  isRoot = false,
  result: TSESTree.StringLiteral[] = [],
): TSESTree.StringLiteral[] {
  for (const propertyNode of node.properties) {
    if (isProperty(propertyNode)) {
      if (isStringLiteral(propertyNode.key) && !isRoot) {
        if (PSEUDO_ELEMENTS.includes(propertyNode.key.value)) {
          result.push(propertyNode.key);
        }
      }

      if (isObjectExpression(propertyNode.value)) {
        findInvalidPseudoElementProperties(propertyNode.value, false, result);
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
            const invalidPseudoElementProperties = findInvalidPseudoElementProperties(argument, true);

            invalidPseudoElementProperties.forEach(invalidPseudoElementProperty => {
              context.report({
                node: invalidPseudoElementProperty,
                messageId: 'invalidPseudoElementNameFound',
                fix: function (fixer) {
                  const start = invalidPseudoElementProperty.range[0] + 1;
                  const end = invalidPseudoElementProperty.range[1];

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
