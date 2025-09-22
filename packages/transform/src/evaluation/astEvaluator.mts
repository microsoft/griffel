import type { Node, ObjectExpression, TemplateLiteral, MemberExpression } from 'oxc-parser';
import type { EvaluationResult } from './types.mjs';

class DeoptError extends Error {}

function evaluateNode(node: Node): unknown {
  switch (node.type) {
    case 'Literal':
      return node.value;

    case 'ObjectExpression':
      return evaluateObjectExpression(node);

    case 'TemplateLiteral':
      return evaluateTemplateLiteral(node);

    case 'MemberExpression':
      return evaluateMemberExpression(node);

    default:
      // Deopt for any unsupported node type
      throw new DeoptError(`Unsupported node type: ${node.type}`);
  }
}

function evaluateObjectExpression(node: ObjectExpression): unknown {
  const obj: Record<string, unknown> = {};

  for (const prop of node.properties) {
    if (prop.type !== 'Property' || prop.kind !== 'init') {
      // Can't handle methods, getters, setters, or spread
      throw new DeoptError('Only standard properties are supported');
    }

    // Get the key
    let key: string;

    if (prop.computed) {
      // Can't handle computed properties like obj[variable]
      throw new DeoptError('Computed properties are not supported');
    } else if (prop.key.type === 'Identifier') {
      key = prop.key.name;
    } else if (prop.key.type === 'Literal') {
      const keyLiteral = prop.key;

      if (typeof keyLiteral.value === 'string' || typeof keyLiteral.value === 'number') {
        key = String(keyLiteral.value);
      } else {
        throw new DeoptError('Unsupported literal key type');
      }
    } else {
      throw new DeoptError('Unsupported key type');
    }

    obj[key] = evaluateNode(prop.value);
  }

  return obj;
}

/**
 * Evaluates template literals that contain Fluent UI design tokens.
 * Transforms `${tokens.propertyName}` expressions into CSS custom properties: `var(--propertyName)`
 *
 * @param node - The TemplateLiteral AST node to evaluate
 * @returns The evaluated string with token expressions converted to CSS custom properties
 */
function evaluateTemplateLiteral(node: TemplateLiteral): string {
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
 * 
 * @param node - The MemberExpression AST node to evaluate
 * @returns The CSS custom property string
 */
function evaluateMemberExpression(node: MemberExpression): string {
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

/**
 * Simple static evaluator for object expressions with nested objects.
 * Based on Babel's evaluation approach but simplified for our specific use case.
 *
 * Handles:
 * - Objects with nested objects: { root: { color: 'red', padding: 0 } }
 * - String literals, numeric literals, boolean literals, null
 * - Simple property access
 */
export function astEvaluator(node: Node): EvaluationResult {
  try {
    return {
      confident: true,
      value: evaluateNode(node),
    };
  } catch {
    return {
      confident: false,
      value: undefined,
    };
  }
}
