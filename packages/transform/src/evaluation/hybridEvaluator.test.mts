import { describe, it, expect, vi } from 'vitest';

import type { Evaluator } from './types.mjs';
import { createHybridEvaluator } from './hybridEvaluator.mjs';

const SHAKER_RESULT: [string, Map<string, string[]>] = ['shaken-code', new Map()];

function createMockShaker() {
  return vi.fn<Evaluator>(() => SHAKER_RESULT);
}

describe('createHybridEvaluator', () => {
  describe('extension fast-paths', () => {
    it('.cjs → ignore (shaker not called)', () => {
      const shaker = createMockShaker();
      const hybrid = createHybridEvaluator(shaker);
      const text = 'module.exports = 42;';

      const result = hybrid('/project/node_modules/pkg/index.cjs', {} as never, text, null);

      expect(result).toEqual([text, null]);
      expect(shaker).not.toHaveBeenCalled();
    });

    it('.cts → ignore (shaker not called)', () => {
      const shaker = createMockShaker();
      const hybrid = createHybridEvaluator(shaker);
      const text = 'module.exports = 42;';

      const result = hybrid('/project/node_modules/pkg/index.cts', {} as never, text, null);

      expect(result).toEqual([text, null]);
      expect(shaker).not.toHaveBeenCalled();
    });

    it('.json → ignore (shaker not called)', () => {
      const shaker = createMockShaker();
      const hybrid = createHybridEvaluator(shaker);
      const text = '{ "key": "value" }';

      const result = hybrid('/project/node_modules/pkg/data.json', {} as never, text, null);

      expect(result).toEqual([text, null]);
      expect(shaker).not.toHaveBeenCalled();
    });

    it('.mjs → delegates to shaker', () => {
      const shaker = createMockShaker();
      const hybrid = createHybridEvaluator(shaker);
      const text = 'export const x = 1;';

      const result = hybrid('/project/node_modules/pkg/index.mjs', {} as never, text, ['x']);

      expect(result).toBe(SHAKER_RESULT);
      expect(shaker).toHaveBeenCalledOnce();
    });

    it('.mts → delegates to shaker', () => {
      const shaker = createMockShaker();
      const hybrid = createHybridEvaluator(shaker);
      const text = 'export const x: number = 1;';

      const result = hybrid('/project/node_modules/pkg/index.mts', {} as never, text, ['x']);

      expect(result).toBe(SHAKER_RESULT);
      expect(shaker).toHaveBeenCalledOnce();
    });
  });

  describe('content-based detection (.js)', () => {
    it('CJS content → ignore (shaker not called)', () => {
      const shaker = createMockShaker();
      const hybrid = createHybridEvaluator(shaker);
      const text = 'const x = require("foo");\nmodule.exports = x;';

      const result = hybrid('/project/node_modules/pkg/index.js', {} as never, text, null);

      expect(result).toEqual([text, null]);
      expect(shaker).not.toHaveBeenCalled();
    });

    it('ESM content → delegates to shaker', () => {
      const shaker = createMockShaker();
      const hybrid = createHybridEvaluator(shaker);
      const text = 'export const x = 1;';

      const result = hybrid('/project/node_modules/pkg/index.js', {} as never, text, ['x']);

      expect(result).toBe(SHAKER_RESULT);
      expect(shaker).toHaveBeenCalledOnce();
    });

    it('ESM with import → delegates to shaker', () => {
      const shaker = createMockShaker();
      const hybrid = createHybridEvaluator(shaker);
      const text = 'import { foo } from "bar";\nexport const x = foo;';

      const result = hybrid('/project/node_modules/pkg/index.js', {} as never, text, ['x']);

      expect(result).toBe(SHAKER_RESULT);
      expect(shaker).toHaveBeenCalledOnce();
    });
  });
});
