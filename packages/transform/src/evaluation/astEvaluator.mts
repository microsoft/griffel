import type { Node, ObjectExpression, Program, TemplateLiteral } from 'oxc-parser';
import type { EvaluationResult, AstEvaluatorContext, AstEvaluatorPlugin } from './types.mjs';

export class DeoptError extends Error {}

/**
 * Simple static evaluator for object expressions with nested objects.
 * Based on Babel's evaluation approach but simplified for our specific use case.
 *
 * Handles:
 * - Objects with nested objects: { root: { color: 'red', padding: 0 } }
 * - String literals, numeric literals, boolean literals, null
 * - Simple property access
 *
 * Plugins can extend evaluation to handle additional node types.
 */
export function astEvaluator(
  node: Node,
  programAst: Program,
  plugins: AstEvaluatorPlugin[] = [],
): EvaluationResult {
  function evaluateNode(node: Node): unknown {
    // Base cases
    switch (node.type) {
      case 'Literal':
        return node.value;

      case 'ObjectExpression':
        return evaluateObjectExpression(node);

      case 'TemplateLiteral':
        if ((node as TemplateLiteral).expressions.length === 0) {
          return (node as TemplateLiteral).quasis[0].value.cooked;
        }
        break;
    }

    // Try plugins in order
    const context: AstEvaluatorContext = { programAst, evaluateNode };
    for (const plugin of plugins) {
      try {
        return plugin.evaluateNode(node, context);
      } catch (e) {
        if (e instanceof DeoptError) continue;
        throw e;
      }
    }

    throw new DeoptError(`Unsupported node type: ${node.type}`);
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
