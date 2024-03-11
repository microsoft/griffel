import { inset } from './inset';

describe('inset', () => {
  it('for a given value', () => {
    expect(inset('12px')).toEqual({
      inset: '12px',
    });
  });

  it('for given vertical and horizontal values', () => {
    expect(inset('12px', '24px')).toEqual({
      inset: '12px 24px',
    });
  });

  it('for given top, horizontal and bottom values', () => {
    expect(inset('12px', '24px', '36px')).toEqual({
      inset: '12px 24px 36px',
    });
  });

  it('for given top, right, bottom and left values', () => {
    expect(inset('12px', '24px', '36px', '48px')).toEqual({
      inset: '12px 24px 36px 48px',
    });
  });

  it('for a given zero value', () => {
    expect(inset(0)).toEqual({
      inset: 0,
    });
  });

  it('for fallback value arrays', () => {
    expect(inset([0, '12px'], ['auto', '-2px'])).toEqual({
      bottom: [0, '12px'],
      left: ['auto', '-2px'],
      right: ['auto', '-2px'],
      top: [0, '12px'],
    });
  });
});
