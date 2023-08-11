import { ESLintUtils, TSESTree } from '@typescript-eslint/utils';
import * as CSS from 'csstype';

import { createRule } from '../utils/createRule';
import { isIdentifier, isLiteral, isMakeStylesIdentifier, isObjectExpression, isProperty } from '../utils/helpers';

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

type ShorthandToArguments = (value: string | number) => string[] | null;

// Matches CSS functions, i.e. `rgb(255, 255, 255)` or `var(--color)`, as well as CSS values, i.e. `1px`, `solid`, and `red`.
const CSS_FUNCTION_OR_VALUE = /(?:[a-zA-Z]+\(.*\)|[#\w-]+)/g;

/**
 * Splits a string into an array of CSS functions and values.
 * If a number is provided, we assume it represents a pixel value.
 */
const splitShorthandIntoParts: ShorthandToArguments = value => {
  if (typeof value !== 'string') {
    if (value === 0) {
      value = '0';
    } else {
      value = `${value}px`;
    }
  }
  return value.match(CSS_FUNCTION_OR_VALUE);
};

// Transforms shorthand string into args for griffel shorthands.<name>() function.
const SHORTHAND_FUNCTIONS: Partial<Record<keyof CSS.StandardShorthandProperties, ShorthandToArguments>> = {
  border: splitShorthandIntoParts,
  borderLeft: splitShorthandIntoParts,
  borderBottom: splitShorthandIntoParts,
  borderRight: splitShorthandIntoParts,
  borderTop: splitShorthandIntoParts,
  borderColor: splitShorthandIntoParts,
  borderStyle: splitShorthandIntoParts,
  borderRadius: splitShorthandIntoParts,
  borderWidth: splitShorthandIntoParts,
  flex(value) {
    if (typeof value !== 'string') {
      // Instead of converting to pixels, convert to flex-grow value.
      value = value.toString();
    }
    return value.match(CSS_FUNCTION_OR_VALUE);
  },
  gap: splitShorthandIntoParts,
  gridArea(value) {
    if (typeof value !== 'string') {
      value = value.toString();
    }
    // Split every `/` character (and trim whitespace)
    return value.split(/\s*\/\s*/g);
  },
  margin: splitShorthandIntoParts,
  marginBlock: splitShorthandIntoParts,
  marginInline: splitShorthandIntoParts,
  padding: splitShorthandIntoParts,
  paddingBlock: splitShorthandIntoParts,
  paddingInline: splitShorthandIntoParts,
  overflow: splitShorthandIntoParts,
  inset: splitShorthandIntoParts,
  outline: splitShorthandIntoParts,
  textDecoration: splitShorthandIntoParts,
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
        if (isMakeStylesIdentifier(node.callee)) {
          const argument = node.arguments[0];

          if (isObjectExpression(argument)) {
            const shorthandProperties = findShorthandProperties(argument, true);

            shorthandProperties.forEach(shorthandProperty => {
              const propertyNode = shorthandProperty.parent as TSESTree.Property;
              let autoFixArguments: string[] | null = null;
              if (isLiteral(propertyNode.value)) {
                const { value } = propertyNode.value;
                const shorthandToArguments =
                  SHORTHAND_FUNCTIONS[shorthandProperty.name as keyof CSS.StandardShorthandProperties];
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
