import { normalizeCSSBucketEntry } from './normalizeCSSBucketEntry';

describe('normalizeCSSBucketEntry', () => {
  it('should handle string entry', () => {
    const cssRule = '.foo { color: red; }';
    expect(normalizeCSSBucketEntry(cssRule)).toEqual([cssRule]);
  });

  it('should handle array entry', () => {
    const cssRule = '.foo { color: red; }';
    expect(normalizeCSSBucketEntry([cssRule, {}])).toEqual([cssRule, {}]);
  });

  it('should throw if array entry contains more than 2 items', () => {
    const cssRule = '.foo { color: red; }';
    // @ts-expect-error types should disallow entries with more than 2 items
    expect(() => normalizeCSSBucketEntry([cssRule, {}, {}])).toThrow(
      'CSS Bucket contains an entry with greater than 2 items, please report this to https://github.com/microsoft/griffel/issues',
    );
  });
});
