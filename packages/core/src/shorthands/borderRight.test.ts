import { borderRight } from './borderRight';

describe('borderRight', () => {
  it('for a given width', () => {
    expect(borderRight('2px')).toEqual({
      borderRightWidth: '2px',
    });
  });

  it('for a given style', () => {
    expect(borderRight('none')).toEqual({
      borderRightStyle: 'none',
    });
  });

  it('for a given width and style', () => {
    expect(borderRight('2px', 'solid')).toEqual({
      borderRightWidth: '2px',
      borderRightStyle: 'solid',
    });
  });

  it('for a given style and width', () => {
    expect(borderRight('solid', '2px')).toEqual({
      borderRightWidth: '2px',
      borderRightStyle: 'solid',
    });
  });

  it('for a given width, style and color', () => {
    expect(borderRight('2px', 'solid', 'red')).toEqual({
      borderRightWidth: '2px',
      borderRightStyle: 'solid',
      borderRightColor: 'red',
    });
  });

  it('for a given style, width and color', () => {
    expect(borderRight('solid', '2px', 'red')).toEqual({
      borderRightStyle: 'solid',
      borderRightWidth: '2px',
      borderRightColor: 'red',
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
