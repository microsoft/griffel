import { parseSync, type ObjectExpression, type Program } from 'oxc-parser';
import { walk } from 'oxc-walker';
import { describe, it, expect } from 'vitest';

import { astEvaluator } from './astEvaluator.mjs';
import { fluentTokensPlugin } from './fluentTokensPlugin.mjs';

function getFirstObjectExpression(code: string): { node: ObjectExpression; program: Program } {
  const result = parseSync('test.js', code);

  if (result.errors.length > 0) {
    throw new Error(`Parsing errors: ${result.errors.map(e => e.message).join(', ')}`);
  }

  let objectExpression: ObjectExpression | null = null;

  walk(result.program, {
    enter(node) {
      if (node.type === 'ObjectExpression' && !objectExpression) {
        objectExpression = node;
      }
    },
  });

  if (!objectExpression) {
    throw new Error('No "ObjectExpression" found in the code');
  }

  return { node: objectExpression, program: result.program };
}

describe('staticEvaluator', () => {
  it('evaluates simple object expressions', () => {
    const code = 'const obj = { color: "red", size: 14 };';

    const { node, program } = getFirstObjectExpression(code);
    const evaluation = astEvaluator(node, program);

    expect(evaluation.confident).toBe(true);
    expect(evaluation.value).toEqual({ color: 'red', size: 14 });
  });

  it('evaluates nested object expressions', () => {
    const code = 'const obj = { root: { color: "blue", padding: 0 }, secondary: { bg: "white" } };';

    const { node, program } = getFirstObjectExpression(code);
    const evaluation = astEvaluator(node, program);

    expect(evaluation.confident).toBe(true);
    expect(evaluation.value).toEqual({
      root: { color: 'blue', padding: 0 },
      secondary: { bg: 'white' },
    });
  });

  it('handles mixed literal types', () => {
    const code = 'const obj = { str: "hello", num: 42, bool: true, nil: null };';

    const { node, program } = getFirstObjectExpression(code);
    const evaluation = astEvaluator(node, program);

    expect(evaluation.confident).toBe(true);
    expect(evaluation.value).toEqual({
      str: 'hello',
      num: 42,
      bool: true,
      nil: null,
    });
  });

  it('returns confident: false for unsupported expressions', () => {
    const code = 'const obj = { computed: variable };';

    const { node, program } = getFirstObjectExpression(code);
    const evaluation = astEvaluator(node, program);

    expect(evaluation.confident).toBe(false);
    expect(evaluation.value).toBeUndefined();
  });

  it('returns confident: false for TemplateLiteral without plugins', () => {
    const code = 'const obj = { margin: `${tokens.spacingVerticalS} 0` };';

    const { node, program } = getFirstObjectExpression(code);
    const evaluation = astEvaluator(node, program);

    expect(evaluation.confident).toBe(false);
    expect(evaluation.value).toBeUndefined();
  });

  it('returns confident: false for MemberExpression without plugins', () => {
    const code = 'const obj = { color: tokens.colorNeutralForeground1Selected };';

    const { node, program } = getFirstObjectExpression(code);
    const evaluation = astEvaluator(node, program);

    expect(evaluation.confident).toBe(false);
    expect(evaluation.value).toBeUndefined();
  });

  describe('@fluentui/react-components integration', () => {
    it('evaluates style object with tokens when fluentTokensPlugin is provided', () => {
      const code = `
export const useButtonStyles = makeStyles({
    staticWrapper: {
        margin: \`\${tokens.spacingVerticalS} 0\`,
        display: 'inline-block',
        color: tokens.colorNeutralForeground1Selected,
    }
});
`;

      const { node, program } = getFirstObjectExpression(code);
      const evaluation = astEvaluator(node, program, [fluentTokensPlugin]);

      expect(evaluation.confident).toBe(true);
      expect(evaluation.value).toEqual({
        staticWrapper: {
          margin: 'var(--spacingVerticalS) 0',
          display: 'inline-block',
          color: 'var(--colorNeutralForeground1Selected)',
        },
      });
    });
  });
});
