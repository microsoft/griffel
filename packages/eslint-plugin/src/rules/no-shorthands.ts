import type { ESLintUtils, TSESTree } from '@typescript-eslint/utils';
import type * as CSS from 'csstype';

import { createRule } from '../utils/createRule';
import { isIdentifier, isLiteral, isMakeStylesCallExpression, isObjectExpression, isProperty } from '../utils/helpers';
import { buildShorthandSplitter } from '../utils/buildShorthandSplitter';

export const RULE_NAME = 'no-shorthands';

// This collection is a map simply for faster access when checking if a CSS property is unsupported
// @griffel/core has the same definition, but ESLint plugin should not depend on it
const UNSUPPORTED_CSS_PROPERTIES: Record<keyof CSS.StandardShorthandProperties, true> = {
  all: true,
  animation: true,
  animationRange: true,
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
  viewTimeline: true,
};

const pxSplitter = buildShorthandSplitter({ numberUnit: 'px' });

// Transforms shorthand string into args for griffel shorthands.<name>() function.
const SHORTHAND_FUNCTIONS: Partial<
  Record<keyof typeof UNSUPPORTED_CSS_PROPERTIES, ReturnType<typeof buildShorthandSplitter>>
> = {
  border: pxSplitter,
  borderLeft: pxSplitter,
  borderBottom: pxSplitter,
  borderRight: pxSplitter,
  borderTop: pxSplitter,
  borderColor: pxSplitter,
  borderStyle: pxSplitter,
  borderRadius: pxSplitter,
  borderWidth: pxSplitter,
  // Instead of converting to pixels, convert to flex-grow value.
  flex: buildShorthandSplitter({ numberUnit: '' }),
  gap: pxSplitter,
  // Split every `/` character (and trim whitespace)
  gridArea: buildShorthandSplitter({ separator: '/' }),
  margin: pxSplitter,
  marginBlock: pxSplitter,
  marginInline: pxSplitter,
  padding: pxSplitter,
  paddingBlock: pxSplitter,
  paddingInline: pxSplitter,
  overflow: pxSplitter,
  inset: pxSplitter,
  outline: pxSplitter,
  textDecoration: pxSplitter,
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
    fixable: 'code',
    messages: {
      shorthandFound: 'Usage of shorthands is prohibited',
    },
    schema: [],
  },
  defaultOptions: [],

  create(context) {
    return {
      CallExpression(node) {
        if (isMakeStylesCallExpression(node, 'makeStyles')) {
          const argument = node.arguments[0];

          if (isObjectExpression(argument)) {
            const shorthandProperties = findShorthandProperties(argument, true);

            shorthandProperties.forEach(shorthandProperty => {
              const propertyNode = shorthandProperty.parent as TSESTree.Property;
              let autoFixArguments: string[] | null = null;
              if (isLiteral(propertyNode.value)) {
                const { value } = propertyNode.value;
                const shorthandToArguments =
                  SHORTHAND_FUNCTIONS[shorthandProperty.name as keyof typeof UNSUPPORTED_CSS_PROPERTIES];
                if (shorthandToArguments !== undefined && (typeof value === 'string' || typeof value === 'number')) {
                  autoFixArguments = shorthandToArguments(value);
                }
              }

              context.report({
                node: shorthandProperty,
                messageId: 'shorthandFound',
                fix:
                  autoFixArguments != null
                    ? fixer => {
                        const args = autoFixArguments!.map(arg => `'${arg}'`).join(', ');
                        return fixer.replaceText(propertyNode, `...shorthands.${shorthandProperty.name}(${args})`);
                      }
                    : undefined,
              });
            });
          }
        }
      },
    };
  },
});
