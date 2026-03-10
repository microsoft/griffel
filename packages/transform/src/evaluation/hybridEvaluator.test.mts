import { describe, it, expect, vi } from 'vitest';

import type { Evaluator } from './types.mjs';
import { createHybridEvaluator } from './hybridEvaluator.mjs';

const SHAKER_RESULT = { code: 'shaken-code', imports: new Map<string, string[]>(), moduleKind: 'esm' as const };

function createMockShaker() {
  return vi.fn<Evaluator>(() => SHAKER_RESULT);
}

describe('createHybridEvaluator', () => {
  describe('non-node_modules files', () => {
    it('always delegates to shaker', () => {
      const shaker = createMockShaker();
      const hybrid = createHybridEvaluator(shaker);
      const filename = '/project/src/styles.ts';
      const text = 'export const x = 1;';
      const only = ['x'];

      const result = hybrid(filename, text, only);

      expect(result).toBe(SHAKER_RESULT);
      expect(shaker).toHaveBeenCalledWith(filename, text, only);
    });
  });

  describe('node_modules files', () => {
    describe('extension fast-paths', () => {
    it('.cjs → ignore (shaker not called)', () => {
      const shaker = createMockShaker();
      const hybrid = createHybridEvaluator(shaker);
      const text = 'module.exports = 42;';

      const result = hybrid('/project/node_modules/pkg/index.cjs', text, null);

      expect(result).toEqual({ code: text, imports: null, moduleKind: 'cjs' });
      expect(shaker).not.toHaveBeenCalled();
    });

    it('.cts → ignore (shaker not called)', () => {
      const shaker = createMockShaker();
      const hybrid = createHybridEvaluator(shaker);
      const text = 'module.exports = 42;';

      const result = hybrid('/project/node_modules/pkg/index.cts', text, null);

      expect(result).toEqual({ code: text, imports: null, moduleKind: 'cjs' });
      expect(shaker).not.toHaveBeenCalled();
    });

    it('.json → ignore (shaker not called)', () => {
      const shaker = createMockShaker();
      const hybrid = createHybridEvaluator(shaker);
      const text = '{ "key": "value" }';

      const result = hybrid('/project/node_modules/pkg/data.json', text, null);

      expect(result).toEqual({ code: text, imports: null, moduleKind: 'cjs' });
      expect(shaker).not.toHaveBeenCalled();
    });

    it('.mjs → delegates to shaker', () => {
      const shaker = createMockShaker();
      const hybrid = createHybridEvaluator(shaker);
      const filename = '/project/node_modules/pkg/index.mjs';
      const text = 'export const x = 1;';
      const only = ['x'];

      const result = hybrid(filename, text, only);

      expect(result).toBe(SHAKER_RESULT);
      expect(shaker).toHaveBeenCalledWith(filename, text, only);
    });

    it('.mts → delegates to shaker', () => {
      const shaker = createMockShaker();
      const hybrid = createHybridEvaluator(shaker);
      const filename = '/project/node_modules/pkg/index.mts';
      const text = 'export const x: number = 1;';
      const only = ['x'];

      const result = hybrid(filename, text, only);

      expect(result).toBe(SHAKER_RESULT);
      expect(shaker).toHaveBeenCalledWith(filename, text, only);
    });
    });

    describe('content-based detection (.js)', () => {
    it('CJS content → ignore (shaker not called)', () => {
      const shaker = createMockShaker();
      const hybrid = createHybridEvaluator(shaker);
      const text = 'const x = require("foo");\nmodule.exports = x;';

      const result = hybrid('/project/node_modules/pkg/index.js', text, null);

      expect(result).toEqual({ code: text, imports: null, moduleKind: 'cjs' });
      expect(shaker).not.toHaveBeenCalled();
    });

    it('ESM content → delegates to shaker', () => {
      const shaker = createMockShaker();
      const hybrid = createHybridEvaluator(shaker);
      const filename = '/project/node_modules/pkg/index.js';
      const text = 'export const x = 1;';
      const only = ['x'];

      const result = hybrid(filename, text, only);

      expect(result).toBe(SHAKER_RESULT);
      expect(shaker).toHaveBeenCalledWith(filename, text, only);
    });

    it('ESM with import → delegates to shaker', () => {
      const shaker = createMockShaker();
      const hybrid = createHybridEvaluator(shaker);
      const filename = '/project/node_modules/pkg/index.js';
      const text = 'import { foo } from "bar";\nexport const x = foo;';
      const only = ['x'];

      const result = hybrid(filename, text, only);

      expect(result).toBe(SHAKER_RESULT);
      expect(shaker).toHaveBeenCalledWith(filename, text, only);
    });
    });
  });
});
