import type { MemberExpression, TemplateLiteral } from 'oxc-parser';

import { DEOPT, type Deopt } from './astEvaluator.mjs';
import type { AstEvaluatorPlugin } from './types.mjs';

/**
 * Evaluates template literals that contain Fluent UI design tokens.
 * Transforms `${tokens.propertyName}` expressions into CSS custom properties: `var(--propertyName)`
 */
function evaluateTemplateLiteralWithTokens(node: TemplateLiteral): string | Deopt {
  let result = '';

  for (let i = 0; i < node.quasis.length; i++) {
    result += node.quasis[i].value.cooked;

    if (i < node.expressions.length) {
      const expression = node.expressions[i];

      if (
        expression.type === 'MemberExpression' &&
        expression.object.type === 'Identifier' &&
        expression.object.name === 'tokens' &&
        expression.property.type === 'Identifier' &&
        !expression.computed
      ) {
        result += `var(--${expression.property.name})`;
      } else {
        return DEOPT;
      }
    }
  }

  return result;
}

/**
 * Evaluates member expressions that reference Fluent UI design tokens.
 * Transforms `tokens.propertyName` expressions into CSS custom properties: `var(--propertyName)`
 */
function evaluateTokensMemberExpression(node: MemberExpression): string | Deopt {
  if (
    node.object.type === 'Identifier' &&
    node.object.name === 'tokens' &&
    node.property.type === 'Identifier' &&
    !node.computed
  ) {
    return `var(--${node.property.name})`;
  } else {
    return DEOPT;
  }
}

export const fluentTokensPlugin: AstEvaluatorPlugin = {
  name: 'fluentTokensPlugin',
  evaluateNode(node) {
    switch (node.type) {
      case 'TemplateLiteral':
        return evaluateTemplateLiteralWithTokens(node);
      case 'MemberExpression':
        return evaluateTokensMemberExpression(node);
      default:
        return DEOPT;
    }
  },
};
