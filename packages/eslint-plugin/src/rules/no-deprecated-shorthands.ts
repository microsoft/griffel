import { ESLintUtils } from '@typescript-eslint/utils';

import { getDocsUrl } from '../utils/getDocsUrl';
import { SHORTHAND_FUNCTIONS } from '../utils/shorthandToArguments';
import { getShorthandName } from '../utils/helpers';
import { UNSUPPORTED_CSS_PROPERTIES } from '../utils/shorthandToArguments';

export const RULE_NAME = 'no-deprecated-shorthands';

export const noDeprecatedShorthandsRule = ESLintUtils.RuleCreator(getDocsUrl)({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Most CSS shorthands are now supported in Griffel, so use them instead of shorthand functions',
      recommended: 'recommended',
    },
    messages: {
      invalidShorthand: 'Use CSS shorthand property instead of the shorthand function.',
    },
    schema: [],
  },
  defaultOptions: [],

  create(context) {
    return {
      CallExpression(node) {
        const shorthandName = getShorthandName(node.callee);

        if (shorthandName && shorthandName in SHORTHAND_FUNCTIONS && !(shorthandName in UNSUPPORTED_CSS_PROPERTIES)) {
          context.report({
            node: node,
            messageId: 'invalidShorthand',
          });
        }
      },
    };
  },
});
