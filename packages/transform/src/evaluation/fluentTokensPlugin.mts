import type { MemberExpression, TemplateLiteral } from 'oxc-parser';
import { DeoptError } from './astEvaluator.mjs';
import type { AstEvaluatorContext, AstEvaluatorPlugin } from './types.mjs';

/**
 * Evaluates template literals that contain Fluent UI design tokens.
 * Transforms `${tokens.propertyName}` expressions into CSS custom properties: `var(--propertyName)`
 */
function evaluateTemplateLiteralWithTokens(node: TemplateLiteral, context: AstEvaluatorContext): string {
  let result = '';

  for (let i = 0; i < node.quasis.length; i++) {
    // Add the literal part
    result += node.quasis[i].value.cooked;

    // Add the expression part if it exists
    if (i < node.expressions.length) {
      const expression = node.expressions[i];

      // Handle tokens.propertyName expressions specifically
      if (
        expression.type === 'MemberExpression' &&
        expression.object.type === 'Identifier' &&
        expression.object.name === 'tokens' &&
        expression.property.type === 'Identifier' &&
        !expression.computed
      ) {
        // Transform tokens.propertyName to var(--propertyName)
        result += `var(--${expression.property.name})`;
      } else {
        // For any other expression type, we can't evaluate it
        throw new DeoptError('Only tokens.propertyName expressions are supported in template literals');
      }
    }
  }

  return result;
}

/**
 * Evaluates member expressions that reference Fluent UI design tokens.
 * Transforms `tokens.propertyName` expressions into CSS custom properties: `var(--propertyName)`
 */
function evaluateTokensMemberExpression(node: MemberExpression): string {
  // Handle tokens.propertyName expressions specifically
  if (
    node.object.type === 'Identifier' &&
    node.object.name === 'tokens' &&
    node.property.type === 'Identifier' &&
    !node.computed
  ) {
    // Transform tokens.propertyName to var(--propertyName)
    return `var(--${node.property.name})`;
  } else {
    // For any other member expression, we can't evaluate it
    throw new DeoptError('Only tokens.propertyName member expressions are supported');
  }
}

export const fluentTokensPlugin: AstEvaluatorPlugin = {
  name: 'fluentTokensPlugin',
  evaluateNode(node, context) {
    switch (node.type) {
      case 'TemplateLiteral':
        return evaluateTemplateLiteralWithTokens(node as TemplateLiteral, context);
      case 'MemberExpression':
        return evaluateTokensMemberExpression(node as MemberExpression);
      default:
        throw new DeoptError(`fluentTokensPlugin: unsupported node type: ${node.type}`);
    }
  },
};
