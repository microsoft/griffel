import { describe, it, expect } from 'vitest';
import { trimSelector } from './trimSelector.js';

describe('trimSelector', () => {
  it('trims ">"', () => {
    expect(trimSelector('>.foo')).toBe('>.foo');
    expect(trimSelector('> .foo')).toBe('>.foo');
    expect(trimSelector('>  .foo')).toBe('>.foo');

    expect(trimSelector('> .foo > .bar')).toBe('>.foo >.bar');
  });
});
