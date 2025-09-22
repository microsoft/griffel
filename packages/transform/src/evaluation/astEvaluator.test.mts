import { parseSync, type ObjectExpression } from 'oxc-parser';
import { walk } from 'oxc-walker';
import { describe, it, expect } from 'vitest';

import { astEvaluator } from './astEvaluator.mjs';

function getFirstObjectExpression(code: string) {
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

  return objectExpression;
}

describe('staticEvaluator', () => {
  it('evaluates simple object expressions', () => {
    const code = 'const obj = { color: "red", size: 14 };';

    const objectNode = getFirstObjectExpression(code);
    const evaluation = astEvaluator(objectNode);

    expect(evaluation.confident).toBe(true);
    expect(evaluation.value).toEqual({ color: 'red', size: 14 });
  });

  it('evaluates nested object expressions', () => {
    const code = 'const obj = { root: { color: "blue", padding: 0 }, secondary: { bg: "white" } };';

    const objectNode = getFirstObjectExpression(code);
    const evaluation = astEvaluator(objectNode);

    expect(evaluation.confident).toBe(true);
    expect(evaluation.value).toEqual({
      root: { color: 'blue', padding: 0 },
      secondary: { bg: 'white' },
    });
  });

  it('handles mixed literal types', () => {
    const code = 'const obj = { str: "hello", num: 42, bool: true, nil: null };';

    const objectNode = getFirstObjectExpression(code);
    const evaluation = astEvaluator(objectNode);

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

    const objectNode = getFirstObjectExpression(code);
    const evaluation = astEvaluator(objectNode);

    expect(evaluation.confident).toBe(false);
    expect(evaluation.value).toBeUndefined();
  });

  describe('@fluentui/react-components integration', () => {
    it('evaluates style object with tokens', () => {
      const code = `
export const useButtonStyles = makeStyles({
    staticWrapper: {
        margin: \`\${tokens.spacingVerticalS} 0\`,
        display: 'inline-block',
        color: tokens.colorNeutralForeground1Selected,
    }
});
`;

      const objectExpression = getFirstObjectExpression(code);
      const evaluation = astEvaluator(objectExpression);

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
