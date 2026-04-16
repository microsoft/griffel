import { describe, it, expect } from 'vitest';
import { isScopeSelector } from './isScopeSelector';

describe('isScopeSelector', () => {
  it('returns true for @scope selectors', () => {
    expect(isScopeSelector('@scope (&)')).toBe(true);
    expect(isScopeSelector('@scope (&) to (&)')).toBe(true);
    expect(isScopeSelector('@scope (.foo)')).toBe(true);
  });

  it('returns false for non-scope selectors', () => {
    expect(isScopeSelector('@media screen')).toBe(false);
    expect(isScopeSelector('@container foo')).toBe(false);
    expect(isScopeSelector('@supports (display: grid)')).toBe(false);
    expect(isScopeSelector(':hover')).toBe(false);
    expect(isScopeSelector('& .child')).toBe(false);
  });
});
