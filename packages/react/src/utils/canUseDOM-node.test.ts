/*
 * @jest-environment node
 */

// 👆 this is intentionally to test in SSR like environment

import { canUseDOM } from './canUseDOM';

describe('canUseDOM (node)', () => {
  it('returns "false"', () => {
    expect(canUseDOM()).toBe(false);
  });
});
