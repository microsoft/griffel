/*
 * @vitest-environment node
 */

// 👆 this is intentionally to test in SSR like environment

import { describe, it, test, expect } from 'vitest';
import { canUseDOM } from './canUseDOM';

describe('canUseDOM (node)', () => {
  it('returns "false"', () => {
    expect(canUseDOM()).toBe(false);
  });
});
