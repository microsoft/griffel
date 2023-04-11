import { paddingInline } from './paddingInline';

describe('paddingInline', () => {
  it('for a given value', () => {
    expect(paddingInline('12px')).toEqual({
      paddingInlineStart: '12px',
      paddingInlineEnd: '12px',
    });
  });

  it('for given start and end', () => {
    expect(paddingInline('12px', '24px')).toEqual({
      paddingInlineStart: '12px',
      paddingInlineEnd: '24px',
    });
  });

  it('for fallback value arrays', () => {
    expect(paddingInline(['12px', 0], ['normal', 'var(--customPaddingInline)'])).toEqual({
      paddingInlineStart: ['12px', 0],
      paddingInlineEnd: ['normal', 'var(--customPaddingInline)'],
    });
  });
});
