import { inset } from './inset';

describe('inset', () => {
  it('for a given value', () => {
    expect(inset('12px')).toEqual({
      bottom: '12px',
      left: '12px',
      right: '12px',
      top: '12px',
    });
  });

  it('for given vertical and horizontal values', () => {
    expect(inset('12px', '24px')).toEqual({
      bottom: '12px',
      left: '24px',
      right: '24px',
      top: '12px',
    });
  });

  it('for given top, horizontal and bottom values', () => {
    expect(inset('12px', '24px', '36px')).toEqual({
      bottom: '36px',
      left: '24px',
      right: '24px',
      top: '12px',
    });
  });

  it('for given top, right, bottom and left values', () => {
    expect(inset('12px', '24px', '36px', '48px')).toEqual({
      bottom: '36px',
      left: '48px',
      right: '24px',
      top: '12px',
    });
  });

  it('for a given zero value', () => {
    expect(inset(0)).toEqual({
      bottom: 0,
      left: 0,
      right: 0,
      top: 0,
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
