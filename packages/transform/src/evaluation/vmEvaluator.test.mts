import { describe, expect, it } from 'vitest';
import { vmEvaluator } from './vmEvaluator.mjs';

const babelOptions = {};
const evaluationRules = [
  {
    test: /[/\\]node_modules[/\\]/,
    action: 'ignore' as const,
  },
];

describe('evaluateStyleExpression', () => {
  it('evaluates expressions with source code context', () => {
    const sourceCode = 'const color = "blue"; const size = 16;';
    const result = vmEvaluator(sourceCode, '/test.ts', '{ color, fontSize: size }', babelOptions, evaluationRules);

    expect(result.confident).toBe(true);
    expect(result.value).toEqual([{ color: 'blue', fontSize: 16 }]);
  });
});
