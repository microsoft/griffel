import { borderRight } from './borderRight';

describe('borderRight', () => {
  it('for a given width', () => {
    expect(borderRight('2px')).toEqual({
      borderRight: '2px',
    });
  });

  it('for a given style', () => {
    expect(borderRight('none')).toEqual({
      borderRight: 'none',
    });
  });

  it('for a given width and style', () => {
    expect(borderRight('2px', 'solid')).toEqual({
      borderRight: '2px solid',
    });
  });

  it('for a given style and width', () => {
    expect(borderRight('solid', '2px')).toEqual({
      borderRight: 'solid 2px',
    });
  });

  it('for a given width, style and color', () => {
    expect(borderRight('2px', 'solid', 'red')).toEqual({
      borderRight: '2px solid red',
    });
  });

  it('for a given style, width and color', () => {
    expect(borderRight('solid', '2px', 'red')).toEqual({
      borderRight: 'solid 2px red',
    });
  });

  it('for fallback value arrays', () => {
    expect(borderRight(['2px', '4px'], ['solid', 'dashed'], ['red', 'green'])).toEqual({
      borderRightColor: ['red', 'green'],
      borderRightStyle: ['solid', 'dashed'],
      borderRightWidth: ['2px', '4px'],
    });
  });
});
