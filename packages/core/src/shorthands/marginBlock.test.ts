import { marginBlock } from './marginBlock';

describe('marginBlock', () => {
  it('for a given value', () => {
    expect(marginBlock('12px')).toEqual({
      marginBlockStart: '12px',
      marginBlockEnd: '12px',
    });
  });

  it('for given start and end', () => {
    expect(marginBlock('12px', '24px')).toEqual({
      marginBlockStart: '12px',
      marginBlockEnd: '24px',
    });
  });

  it('for fallback value arrays', () => {
    expect(marginBlock(['12px', 0], ['normal', 'var(--customMarginBlock)'])).toEqual({
      marginBlockStart: ['12px', 0],
      marginBlockEnd: ['normal', 'var(--customMarginBlock)'],
    });
  });
});
