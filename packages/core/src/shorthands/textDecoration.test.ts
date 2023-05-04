import { textDecoration } from './textDecoration';

describe('textDecoration', () => {
  it('for a given style', () => {
    expect(textDecoration('double')).toEqual({
      textDecorationStyle: 'double',
    });
  });

  it('for a given line', () => {
    expect(textDecoration('none')).toEqual({
      textDecorationLine: 'none',
    });

    expect(textDecoration('overline underline line-through')).toEqual({
      textDecorationLine: 'overline underline line-through',
    });
  });

  it('for a given line and style', () => {
    expect(textDecoration('underline', 'double')).toEqual({
      textDecorationLine: 'underline',
      textDecorationStyle: 'double',
    });
  });

  it('for a given line, style and color', () => {
    expect(textDecoration('underline', 'double', 'red')).toEqual({
      textDecorationLine: 'underline',
      textDecorationStyle: 'double',
      textDecorationColor: 'red',
    });
  });

  it('for a given line, style, color and thickness', () => {
    expect(textDecoration('underline', 'double', 'red', '2px')).toEqual({
      textDecorationLine: 'underline',
      textDecorationStyle: 'double',
      textDecorationColor: 'red',
      textDecorationThickness: '2px',
    });
  });
});
