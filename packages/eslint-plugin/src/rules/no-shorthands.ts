import { ESLintUtils, TSESTree } from '@typescript-eslint/utils';
import * as CSS from 'csstype';

import { createRule } from '../utils/createRule';
import { isIdentifier, isMakeStylesIdentifier, isObjectExpression, isProperty } from '../utils/helpers';

export const RULE_NAME = 'no-shorthands';

// This collection is a map simply for faster access when checking if a CSS property is unsupported
// @griffel/core has the same definition, but ESLint plugin should not depend on it
const UNSUPPORTED_CSS_PROPERTIES: Record<keyof CSS.StandardShorthandProperties, true> = {
  all: true,
  animation: true,
  background: true,
  backgroundPosition: true,
  border: true,
  borderBlock: true,
  borderBlockEnd: true,
  borderBlockStart: true,
  borderBottom: true,
  borderColor: true,
  borderImage: true,
  borderInline: true,
  borderInlineEnd: true,
  borderInlineStart: true,
  borderLeft: true,
  borderRadius: true,
  borderRight: true,
  borderStyle: true,
  borderTop: true,
  borderWidth: true,
  caret: true,
  columns: true,
  columnRule: true,
  containIntrinsicSize: true,
  container: true,
  flex: true,
  flexFlow: true,
  font: true,
  gap: true,
  grid: true,
  gridArea: true,
  gridColumn: true,
  gridRow: true,
  gridTemplate: true,
  inset: true,
  insetBlock: true,
  insetInline: true,
  lineClamp: true,
  listStyle: true,
  margin: true,
  marginBlock: true,
  marginInline: true,
  mask: true,
  maskBorder: true,
  motion: true,
  offset: true,
  outline: true,
  overflow: true,
  overscrollBehavior: true,
  padding: true,
  paddingBlock: true,
  paddingInline: true,
  placeItems: true,
  placeContent: true,
  placeSelf: true,
  scrollMargin: true,
  scrollMarginBlock: true,
  scrollMarginInline: true,
  scrollPadding: true,
  scrollPaddingBlock: true,
  scrollPaddingInline: true,
  scrollSnapMargin: true,
  scrollTimeline: true,
  textDecoration: true,
  textEmphasis: true,
  transition: true,
};

function findShorthandProperties(
  node: TSESTree.ObjectExpression,
  isRoot = false,
  result: TSESTree.Identifier[] = [],
): TSESTree.Identifier[] {
  for (const propertyNode of node.properties) {
    if (isProperty(propertyNode)) {
      if (isIdentifier(propertyNode.key) && !isRoot) {
        if (Object.prototype.hasOwnProperty.call(UNSUPPORTED_CSS_PROPERTIES, propertyNode.key.name)) {
          result.push(propertyNode.key);
        }
      }

      if (isObjectExpression(propertyNode.value)) {
        findShorthandProperties(propertyNode.value, false, result);
      }
    }
  }

  return result;
}

export const noShorthandsRule: ReturnType<ReturnType<typeof ESLintUtils.RuleCreator>> = createRule({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow using CSS shorthands in makeStyles() calls',
      recommended: 'error',
    },
    messages: {
      shorthandFound: 'Usage of shorthands is prohibited',
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
            const shorthandProperties = findShorthandProperties(argument, true);

            shorthandProperties.forEach(shorthandProperty => {
              context.report({
                node: shorthandProperty,
                messageId: 'shorthandFound',
              });
            });
          }
        }
      },
    };
  },
});
