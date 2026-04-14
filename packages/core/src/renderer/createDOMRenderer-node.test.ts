/*
 * @vitest-environment node
 */

// 👆 this is intentionally to test in SSR like environment

import { describe, it, expect } from 'vitest';
import type { CSSRulesByBucket } from '../types.js';
import { createDOMRenderer } from './createDOMRenderer.js';

describe('createDOMRenderer', () => {
  it('"document" should not be defined', () => {
    expect(typeof document).toBe('undefined');
  });

  it('should not throw when document does not exist', () => {
    const renderer = createDOMRenderer(undefined);
    const cssRules: CSSRulesByBucket = {
      d: ['.foo { color: red }'],
    };

    expect(() => renderer.insertCSSRules(cssRules)).not.toThrow();
  });
});
