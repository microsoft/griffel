import type { Node, ObjectExpression, Program, TemplateLiteral } from 'oxc-parser';
import type { EvaluationResult, AstEvaluatorContext, AstEvaluatorPlugin } from './types.mjs';

/**
 * Sentinel value returned by plugins and evaluateNode to signal "can't handle this node".
 * Using a symbol avoids the cost of Error construction and stack trace capture.
 */
export const DEOPT: unique symbol = Symbol('deopt');
export type Deopt = typeof DEOPT;

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
export function astEvaluator(node: Node, programAst: Program, plugins: AstEvaluatorPlugin[] = []): EvaluationResult {
  const context: AstEvaluatorContext = {
    programAst,
    evaluateNode,
  };

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
    // ---

    for (const plugin of plugins) {
      const result = plugin.evaluateNode(node, context);

      if (result !== DEOPT) {
        return result;
      }
    }

    return DEOPT;
  }

  function evaluateObjectExpression(node: ObjectExpression): unknown {
    const obj: Record<string, unknown> = {};

    for (const prop of node.properties) {
      if (prop.type !== 'Property' || prop.kind !== 'init') {
        return DEOPT;
      }

      let key: string;

      if (prop.computed) {
        return DEOPT;
      } else if (prop.key.type === 'Identifier') {
        key = prop.key.name;
      } else if (prop.key.type === 'Literal') {
        const keyLiteral = prop.key;

        if (typeof keyLiteral.value === 'string' || typeof keyLiteral.value === 'number') {
          key = String(keyLiteral.value);
        } else {
          return DEOPT;
        }
      } else {
        return DEOPT;
      }

      const value = evaluateNode(prop.value);

      if (value === DEOPT) {
        return DEOPT;
      }

      obj[key] = value;
    }

    return obj;
  }

  const result = evaluateNode(node);

  if (result === DEOPT) {
    return {
      confident: false,
      value: undefined,
    };
  }

  return {
    confident: true,
    value: result,
  };
}
