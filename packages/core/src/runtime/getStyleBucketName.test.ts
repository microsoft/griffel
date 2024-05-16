import { getStyleBucketName } from './getStyleBucketName';

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
});
