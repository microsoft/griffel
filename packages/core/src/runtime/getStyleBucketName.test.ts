import { describe, expect, it } from 'vitest';
import { getStyleBucketName } from './getStyleBucketName.js';

describe('getStyleBucketName', () => {
  it('returns bucketName based on mapping', () => {
    expect(getStyleBucketName([], { container: '', media: '', supports: '', layer: '', scope: '' })).toBe('d');
    expect(getStyleBucketName(['.foo'], { container: '', media: '', supports: '', layer: '', scope: '' })).toBe('d');

    expect(getStyleBucketName([' :link'], { container: '', media: '', supports: '', layer: '', scope: '' })).toBe('l');
    expect(getStyleBucketName([' :hover '], { container: '', media: '', supports: '', layer: '', scope: '' })).toBe(
      'h',
    );

    expect(getStyleBucketName([':link'], { container: '', media: '', supports: '', layer: '', scope: '' })).toBe('l');
    expect(getStyleBucketName([':visited'], { container: '', media: '', supports: '', layer: '', scope: '' })).toBe(
      'v',
    );
    expect(
      getStyleBucketName([':focus-within'], { container: '', media: '', supports: '', layer: '', scope: '' }),
    ).toBe('w');
    expect(getStyleBucketName([':focus'], { container: '', media: '', supports: '', layer: '', scope: '' })).toBe('f');
    expect(
      getStyleBucketName([':focus-visible'], { container: '', media: '', supports: '', layer: '', scope: '' }),
    ).toBe('i');
    expect(getStyleBucketName([':hover'], { container: '', media: '', supports: '', layer: '', scope: '' })).toBe('h');
    expect(getStyleBucketName([':active'], { container: '', media: '', supports: '', layer: '', scope: '' })).toBe('a');

    expect(getStyleBucketName([':active'], { container: '', media: '', supports: '', layer: 'theme', scope: '' })).toBe(
      't',
    );
    expect(
      getStyleBucketName([':active'], {
        container: '',
        media: '(max-width: 100px)',
        supports: '',
        layer: '',
        scope: '',
      }),
    ).toBe('m');
    expect(
      getStyleBucketName([':active'], {
        container: '',
        media: '',
        supports: '(display: table-cell)',
        layer: '',
        scope: '',
      }),
    ).toBe('t');
    expect(
      getStyleBucketName([':active'], {
        container: 'foo (max-width: 1px)',
        media: '',
        supports: '',
        layer: '',
        scope: '',
      }),
    ).toBe('x');
  });

  // @scope wraps innermost (per compileAtomicCSSRule), so scoped pseudo-rules must remain in
  // their pseudo buckets (h/f/a) to preserve LVHA cascade ordering. @scope by itself does not
  // route into a dedicated bucket — it falls through to the same logic as a non-scoped rule.
  it('@scope does not affect bucket strategy', () => {
    expect(getStyleBucketName([], { container: '', media: '', supports: '', layer: '', scope: 'to (.boundary)' })).toBe(
      'd',
    );
    expect(
      getStyleBucketName([':hover'], { container: '', media: '', supports: '', layer: '', scope: 'to (.boundary)' }),
    ).toBe('h');
    expect(
      getStyleBucketName([':focus'], { container: '', media: '', supports: '', layer: '', scope: 'to (.boundary)' }),
    ).toBe('f');
    expect(
      getStyleBucketName([':active'], { container: '', media: '', supports: '', layer: '', scope: 'to (.boundary)' }),
    ).toBe('a');
  });
});
