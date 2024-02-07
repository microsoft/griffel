import { ESLintUtils } from '@typescript-eslint/utils';
import type { TSESLint, TSESTree } from '@typescript-eslint/utils';

import { isIdentifier, isMakeStylesCallExpression, isObjectExpression, isProperty } from '../utils/helpers';
import { UNSUPPORTED_CSS_PROPERTIES, shorthandToArguments } from '../utils/shorthandToArguments';
import { getDocsUrl } from '../utils/getDocsUrl';
import { getShorthandValue, joinShorthandArguments } from '../utils/getShorthandValue';

export const RULE_NAME = 'no-shorthands';

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

export const noShorthandsRule = ESLintUtils.RuleCreator(getDocsUrl)({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow using CSS shorthands in makeStyles() calls',
      recommended: 'recommended',
    },
    fixable: 'code',
    messages: {
      shorthandFound: 'Usage of shorthands is prohibited',
    },
    schema: [],
  },
  defaultOptions: [],

  create(context) {
    const sourceCode = context.getSourceCode();
    return {
      CallExpression(node) {
        if (isMakeStylesCallExpression(node, 'makeStyles')) {
          const argument = node.arguments[0];

          if (isObjectExpression(argument)) {
            const shorthandProperties = findShorthandProperties(argument, true);

            shorthandProperties.forEach(shorthandProperty => {
              const propertyNode = shorthandProperty.parent as TSESTree.Property;
              const shorthandLiteral = getShorthandValue(propertyNode.value, sourceCode);

              // Try to create an auto-fixer for the shorthand property.
              let fix: TSESLint.ReportFixFunction | undefined;
              if (shorthandLiteral) {
                const autoFixArguments = shorthandToArguments(shorthandProperty.name, shorthandLiteral.value);
                if (autoFixArguments != null) {
                  fix = fixer => {
                    const args = joinShorthandArguments(autoFixArguments, shorthandLiteral.quote);
                    return fixer.replaceText(propertyNode, `...shorthands.${shorthandProperty.name}(${args})`);
                  };
                }
              }

              context.report({
                node: shorthandProperty,
                messageId: 'shorthandFound',
                fix,
              });
            });
          }
        }
      },
    };
  },
});
