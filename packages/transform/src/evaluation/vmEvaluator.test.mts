import NativeModule from 'node:module';
import { describe, expect, it } from 'vitest';
import shakerEvaluator from '@griffel/transform-shaker';
import { vmEvaluator } from './vmEvaluator.mjs';
import type { TransformResolver } from './module.mjs';

const evaluationRules = [
  {
    test: /[/\\]node_modules[/\\]/,
    action: 'ignore' as const,
  },
  {
    action: shakerEvaluator,
  },
];

const defaultResolve: TransformResolver = (id, opts) =>
  (NativeModule as unknown as { _resolveFilename: (id: string, options: unknown) => string })._resolveFilename(id, opts);

describe('evaluateStyleExpression', () => {
  it('evaluates expressions with source code context', () => {
    const sourceCode = 'const color = "blue"; const size = 16;';
    const result = vmEvaluator(sourceCode, '/test.ts', '{ color, fontSize: size }', evaluationRules, defaultResolve);

    expect(result.confident).toBe(true);
    expect(result.value).toEqual([{ color: 'blue', fontSize: 16 }]);
  });
});
