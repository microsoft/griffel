import { overflow } from './overflow';

describe('overflow', () => {
  it('for a given value', () => {
    expect(overflow('hidden')).toEqual({
      overflow: 'hidden',
    });
  });

  it('for given x and y values', () => {
    expect(overflow('visible', 'hidden')).toEqual({
      overflow: 'visible hidden',
    });
  });

  it('for fallback value arrays', () => {
    expect(overflow('visible', ['hidden', 'scroll'])).toEqual({
      overflowX: 'visible',
      overflowY: ['hidden', 'scroll'],
    });
  });
});
