import { parseSync, type Node, type Program } from 'oxc-parser';
import { walk } from 'oxc-walker';
import { describe, it, expect } from 'vitest';

import { DeoptError } from './astEvaluator.mjs';
import { fluentTokensPlugin } from './fluentTokensPlugin.mjs';
import type { AstEvaluatorContext } from './types.mjs';

function getFirstNodeOfType(code: string, type: string): { node: Node; program: Program } {
  const result = parseSync('test.js', code);

  if (result.errors.length > 0) {
    throw new Error(`Parsing errors: ${result.errors.map(e => e.message).join(', ')}`);
  }

  let found: Node | null = null;

  walk(result.program, {
    enter(node) {
      if (node.type === type && !found) {
        found = node;
      }
    },
  });

  if (!found) {
    throw new Error(`No "${type}" found in the code`);
  }

  return { node: found, program: result.program };
}

function makeContext(program: Program): AstEvaluatorContext {
  return {
    programAst: program,
    evaluateNode: () => {
      throw new DeoptError('stub');
    },
  };
}

describe('fluentTokensPlugin', () => {
  describe('MemberExpression', () => {
    it('evaluates tokens.propertyName to var(--propertyName)', () => {
      const code = 'const x = tokens.colorBrandBackground;';
      const { node, program } = getFirstNodeOfType(code, 'MemberExpression');

      const result = fluentTokensPlugin.evaluateNode(node, makeContext(program));
      expect(result).toBe('var(--colorBrandBackground)');
    });

    it('throws DeoptError for non-tokens member expression', () => {
      const code = 'const x = foo.bar;';
      const { node, program } = getFirstNodeOfType(code, 'MemberExpression');

      expect(() => fluentTokensPlugin.evaluateNode(node, makeContext(program))).toThrow(DeoptError);
    });

    it('throws DeoptError for computed member expression on tokens', () => {
      const code = 'const x = tokens["colorBrandBackground"];';
      const { node, program } = getFirstNodeOfType(code, 'MemberExpression');

      expect(() => fluentTokensPlugin.evaluateNode(node, makeContext(program))).toThrow(DeoptError);
    });
  });

  describe('TemplateLiteral', () => {
    it('evaluates template literal with tokens expression', () => {
      const code = 'const x = `${tokens.spacingVerticalS} 0`;';
      const { node, program } = getFirstNodeOfType(code, 'TemplateLiteral');

      const result = fluentTokensPlugin.evaluateNode(node, makeContext(program));
      expect(result).toBe('var(--spacingVerticalS) 0');
    });

    it('evaluates simple template literal without expressions', () => {
      const code = 'const x = `hello world`;';
      const { node, program } = getFirstNodeOfType(code, 'TemplateLiteral');

      const result = fluentTokensPlugin.evaluateNode(node, makeContext(program));
      expect(result).toBe('hello world');
    });

    it('throws DeoptError for non-tokens expression in template literal', () => {
      const code = 'const x = `${foo.bar} 0`;';
      const { node, program } = getFirstNodeOfType(code, 'TemplateLiteral');

      expect(() => fluentTokensPlugin.evaluateNode(node, makeContext(program))).toThrow(DeoptError);
    });
  });

  describe('unsupported node types', () => {
    it('throws DeoptError for Identifier', () => {
      const code = 'const x = foo;';
      const { node, program } = getFirstNodeOfType(code, 'Identifier');

      expect(() => fluentTokensPlugin.evaluateNode(node, makeContext(program))).toThrow(DeoptError);
    });
  });
});
