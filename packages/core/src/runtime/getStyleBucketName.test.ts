import { describe, it, expect } from 'vitest';
import { getStyleBucketName } from './getStyleBucketName.js';

describe('getStyleBucketName', () => {
  it('returns bucketName based on mapping', () => {
    expect(getStyleBucketName([], { container: '', media: '', supports: '', layer: '' })).toBe('d');
    expect(getStyleBucketName(['.foo'], { container: '', media: '', supports: '', layer: '' })).toBe('d');

    expect(getStyleBucketName([' :link'], { container: '', media: '', supports: '', layer: '' })).toBe('l');
    expect(getStyleBucketName([' :hover '], { container: '', media: '', supports: '', layer: '' })).toBe('h');

    expect(getStyleBucketName([':link'], { container: '', media: '', supports: '', layer: '' })).toBe('l');
    expect(getStyleBucketName([':visited'], { container: '', media: '', supports: '', layer: '' })).toBe('v');
    expect(getStyleBucketName([':focus-within'], { container: '', media: '', supports: '', layer: '' })).toBe('w');
    expect(getStyleBucketName([':focus'], { container: '', media: '', supports: '', layer: '' })).toBe('f');
    expect(getStyleBucketName([':focus-visible'], { container: '', media: '', supports: '', layer: '' })).toBe('i');
    expect(getStyleBucketName([':hover'], { container: '', media: '', supports: '', layer: '' })).toBe('h');
    expect(getStyleBucketName([':active'], { container: '', media: '', supports: '', layer: '' })).toBe('a');

    expect(getStyleBucketName([':active'], { container: '', media: '', supports: '', layer: 'theme' })).toBe('t');
    expect(
      getStyleBucketName([':active'], { container: '', media: '(max-width: 100px)', supports: '', layer: '' }),
    ).toBe('m');
    expect(
      getStyleBucketName([':active'], { container: '', media: '', supports: '(display: table-cell)', layer: '' }),
    ).toBe('t');
    expect(
      getStyleBucketName([':active'], { container: 'foo (max-width: 1px)', media: '', supports: '', layer: '' }),
    ).toBe('c');
  });

  it('returns leading-pseudo bucket by default', () => {
    expect(getStyleBucketName([' .foo:hover'], { container: '', media: '', supports: '', layer: '' })).toBe('d');
    expect(getStyleBucketName(['.disabled:hover'], { container: '', media: '', supports: '', layer: '' })).toBe('d');
  });

  it("with strategy='extended' classifies by last LVHA pseudo anywhere in selector", () => {
    const ar = { container: '', media: '', supports: '', layer: '' };

    // Plain pseudos still map the same as the default strategy.
    expect(getStyleBucketName([':hover'], ar, 'extended')).toBe('h');
    expect(getStyleBucketName([':active'], ar, 'extended')).toBe('a');
    expect(getStyleBucketName([':link'], ar, 'extended')).toBe('l');
    expect(getStyleBucketName([':visited'], ar, 'extended')).toBe('v');
    expect(getStyleBucketName([':focus-within'], ar, 'extended')).toBe('w');
    expect(getStyleBucketName([':focus-visible'], ar, 'extended')).toBe('i');
    expect(getStyleBucketName([':focus'], ar, 'extended')).toBe('f');

    // Nested pseudos are reclassified.
    expect(getStyleBucketName([' .foo:hover'], ar, 'extended')).toBe('h');
    expect(getStyleBucketName(['.disabled:hover'], ar, 'extended')).toBe('h');
    expect(getStyleBucketName([' .foo:focus .bar'], ar, 'extended')).toBe('f');
    expect(getStyleBucketName([' .foo:active'], ar, 'extended')).toBe('a');

    // Multiple LVHA pseudos: the last occurrence wins.
    expect(getStyleBucketName([':focus:hover'], ar, 'extended')).toBe('h');
    expect(getStyleBucketName([':hover:active'], ar, 'extended')).toBe('a');

    // Selectors with no LVHA pseudo still go to default.
    expect(getStyleBucketName(['.foo'], ar, 'extended')).toBe('d');
    expect(getStyleBucketName([':checked'], ar, 'extended')).toBe('d');
    expect(getStyleBucketName([' .foo:checked'], ar, 'extended')).toBe('d');

    // At-rules still take precedence over selector parsing.
    expect(getStyleBucketName([' .foo:hover'], { ...ar, media: '(min-width: 800px)' }, 'extended')).toBe('m');
    expect(getStyleBucketName([' .foo:hover'], { ...ar, layer: 'theme' }, 'extended')).toBe('t');
  });
});
