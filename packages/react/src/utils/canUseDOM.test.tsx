import { describe, it, expect } from 'vitest';
import { canUseDOM } from './canUseDOM';

describe('canUseDOM', () => {
  it('returns "true"', () => {
    expect(canUseDOM()).toBe(true);
  });
});
