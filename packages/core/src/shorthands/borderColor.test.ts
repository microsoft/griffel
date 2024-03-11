import { borderColor } from './borderColor';

describe('borderColor', () => {
  it('for a given value', () => {
    expect(borderColor('red')).toEqual({
      borderColor: 'red',
    });
  });

  it('for given vertical and horizontal values', () => {
    expect(borderColor('red', 'blue')).toEqual({
      borderColor: 'red blue',
    });
  });

  it('for given top, horizontal and bottom values', () => {
    expect(borderColor('red', 'blue', 'green')).toEqual({
      borderColor: 'red blue green',
    });
  });

  it('for given top, right, bottom and left values', () => {
    expect(borderColor('red', 'blue', 'green', 'yellow')).toEqual({
      borderColor: 'red blue green yellow',
    });
  });

  it('for fallback value arrays', () => {
    expect(borderColor(['red', '#f00'], ['blue', '#00f'], ['green', '#0f0'], ['yellow', '#ff0'])).toEqual({
      borderBottomColor: ['green', '#0f0'],
      borderLeftColor: ['yellow', '#ff0'],
      borderRightColor: ['blue', '#00f'],
      borderTopColor: ['red', '#f00'],
    });
  });
});
