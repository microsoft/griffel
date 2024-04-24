import { isShorthandProperty, isVendorProperty, toCamelCase } from './utils';

describe('isShorthandProperty', () => {
  it('returns "true" for shorthand properties', () => {
    expect(
      isShorthandProperty({
        computed: ['margin-top', 'margin-right', 'margin-bottom', 'margin-left'],
        status: 'standard',
      }),
    ).toBe(true);
  });

  it('returns "false" for non-shorthand properties', () => {
    expect(isShorthandProperty({ computed: 'asSpecified', status: 'standard' })).toBe(false);
  });
});

describe('toCamelCase', () => {
  it('transforms CSS properties to camelCase', () => {
    expect(toCamelCase('margin-block')).toBe('marginBlock');
    expect(toCamelCase('margin-block-end')).toBe('marginBlockEnd');
  });
});

describe('isVendorProperty', () => {
  it('returns "true" for vendor-prefixed properties', () => {
    expect(isVendorProperty('-webkit-appearance')).toBe(true);
    expect(isVendorProperty('-moz-appearance')).toBe(true);
  });

  it('returns "false" for non-vendor-prefixed properties', () => {
    expect(isVendorProperty('appearance')).toBe(false);
  });
});
