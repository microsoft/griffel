import { ESLintUtils } from '@typescript-eslint/utils';
import type { TSESTree } from '@typescript-eslint/utils';

import { getDocsUrl } from '../utils/getDocsUrl';
import { isIdentifier, isMemberExpression } from '../utils/helpers';
import { getShorthandValue, joinShorthandArguments } from '../utils/getShorthandValue';
import { shorthandToArguments } from '../utils/shorthandToArguments';

export const RULE_NAME = 'no-invalid-shorthand-argument';

/**
 * Check if the node represents is a shorthand and return the name.
 */
function getShorthandName(node: TSESTree.LeftHandSideExpression): string | undefined {
  if (
    isMemberExpression(node) &&
    isIdentifier(node.object) &&
    isIdentifier(node.property) &&
    node.object.name === 'shorthands'
  ) {
    return node.property.name;
  }
  return undefined;
}

export const noInvalidShorthandArgumentRule = ESLintUtils.RuleCreator(getDocsUrl)({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'All shorthands must not use space separators, and instead pass in multiple arguments',
      recommended: 'recommended',
    },
    messages: {
      invalidShorthandArgument:
        'Each shorthand value must be passed as a separate argument, not a space-separated string.',
    },
    schema: [],
    fixable: 'code',
  },
  defaultOptions: [],

  create(context) {
    const sourceCode = context.getSourceCode();
    return {
      CallExpression(node) {
        const shorthandName = getShorthandName(node.callee);
        if (shorthandName && node.arguments.length === 1) {
          const shorthandLiteral = getShorthandValue(node.arguments[0], sourceCode);
          if (shorthandLiteral) {
            const autoFixArguments = shorthandToArguments(shorthandName, shorthandLiteral.value);
            if (autoFixArguments != null && autoFixArguments.length > 1) {
              context.report({
                node,
                messageId: 'invalidShorthandArgument',
                fix: fixer =>
                  fixer.replaceText(
                    node.arguments[0],
                    joinShorthandArguments(autoFixArguments, shorthandLiteral.quote),
                  ),
              });
            }
          }
        }
      },
    };
  },
});
