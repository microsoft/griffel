import { isAssetUrl } from './isAssetUrl';

describe('isAssetUrl', () => {
  it('handles remote URLs', () => {
    expect(isAssetUrl('data://example.com')).toBe(false);
    expect(isAssetUrl('http://example.com')).toBe(false);
    expect(isAssetUrl('https://example.com')).toBe(false);
    expect(isAssetUrl('//example.com')).toBe(false);
    expect(isAssetUrl('#svg-part')).toBe(false);
  });

  it('handles assets URLs', () => {
    expect(isAssetUrl('../file.jpg')).toBe(true);
    expect(isAssetUrl('./file.jpg')).toBe(true);
  });

  it('handles quotes around URLs', () => {
    expect(isAssetUrl('"//example.com"')).toBe(false);
    expect(isAssetUrl("'//example.com'")).toBe(false);

    expect(isAssetUrl('"./file.jpg"')).toBe(true);
    expect(isAssetUrl("'./file.jpg'")).toBe(true);
  });
});
