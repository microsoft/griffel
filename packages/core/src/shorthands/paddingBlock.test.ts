import { paddingBlock } from './paddingBlock';

describe('paddingBlock', () => {
  it('for a given value', () => {
    expect(paddingBlock('12px')).toEqual({
      paddingBlockStart: '12px',
      paddingBlockEnd: '12px',
    });
  });

  it('for given start and end', () => {
    expect(paddingBlock('12px', '24px')).toEqual({
      paddingBlockStart: '12px',
      paddingBlockEnd: '24px',
    });
  });

  it('for fallback value arrays', () => {
    expect(paddingBlock(['12px', 0], ['normal', 'var(--customPaddingBlock)'])).toEqual({
      paddingBlockStart: ['12px', 0],
      paddingBlockEnd: ['normal', 'var(--customPaddingBlock)'],
    });
  });
});
