import { marginInline } from './marginInline';

describe('marginInline', () => {
  it('for a given value', () => {
    expect(marginInline('12px')).toEqual({
      marginInlineStart: '12px',
      marginInlineEnd: '12px',
    });
  });

  it('for given start and end', () => {
    expect(marginInline('12px', '24px')).toEqual({
      marginInlineStart: '12px',
      marginInlineEnd: '24px',
    });
  });

  it('for fallback value arrays', () => {
    expect(marginInline(['12px', 0], ['normal', 'var(--customMarginInline)'])).toEqual({
      marginInlineStart: ['12px', 0],
      marginInlineEnd: ['normal', 'var(--customMarginInline)'],
    });
  });
});
