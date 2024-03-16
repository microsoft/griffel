import { border } from './border';

describe('border', () => {
  it('for a given width', () => {
    expect(border('2px')).toEqual({
      border: '2px',
    });
  });

  it('for a given style', () => {
    expect(border('none')).toEqual({
      border: 'none',
    });
  });

  it('for a given width and style', () => {
    expect(border('2px', 'solid')).toEqual({
      border: '2px solid',
    });
  });

  it('for a given style and width', () => {
    expect(border('solid', '2px')).toEqual({
      border: 'solid 2px',
    });
  });

  it('for a given width, style and color', () => {
    expect(border('2px', 'solid', 'red')).toEqual({
      border: '2px solid red',
    });
  });

  it('for a given style, width and color', () => {
    expect(border('solid', '2px', 'red')).toEqual({
      border: 'solid 2px red',
    });
  });

  it('for fallback value arrays', () => {
    expect(border(['2px', '4px'], ['solid', 'dashed'], ['red', 'green'])).toEqual({
      borderBottomColor: ['red', 'green'],
      borderBottomStyle: ['solid', 'dashed'],
      borderBottomWidth: ['2px', '4px'],
      borderLeftColor: ['red', 'green'],
      borderLeftStyle: ['solid', 'dashed'],
      borderLeftWidth: ['2px', '4px'],
      borderRightColor: ['red', 'green'],
      borderRightStyle: ['solid', 'dashed'],
      borderRightWidth: ['2px', '4px'],
      borderTopColor: ['red', 'green'],
      borderTopStyle: ['solid', 'dashed'],
      borderTopWidth: ['2px', '4px'],
    });
  });
});
