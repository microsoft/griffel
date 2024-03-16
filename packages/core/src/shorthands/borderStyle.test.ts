import { borderStyle } from './borderStyle';

describe('borderStyle', () => {
  it('for a given value', () => {
    expect(borderStyle('solid')).toEqual({
      borderStyle: 'solid',
    });
  });

  it('for given vertical and horizontal values', () => {
    expect(borderStyle('solid', 'dashed')).toEqual({
      borderStyle: 'solid dashed',
    });
  });

  it('for given top, horizontal and bottom values', () => {
    expect(borderStyle('solid', 'dashed', 'dotted')).toEqual({
      borderStyle: 'solid dashed dotted',
    });
  });

  it('for given top, right, bottom and left values', () => {
    expect(borderStyle('solid', 'dashed', 'dotted', 'double')).toEqual({
      borderStyle: 'solid dashed dotted double',
    });
  });

  it('for fallback value arrays', () => {
    expect(borderStyle(['solid', 'groove'], ['dashed', 'hidden'], ['dotted', 'none'], ['double', 'outset'])).toEqual({
      borderBottomStyle: ['dotted', 'none'],
      borderLeftStyle: ['double', 'outset'],
      borderRightStyle: ['dashed', 'hidden'],
      borderTopStyle: ['solid', 'groove'],
    });
  });
});
