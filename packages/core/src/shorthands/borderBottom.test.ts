import { borderBottom } from './borderBottom';

describe('borderBottom', () => {
  it('for a given width', () => {
    expect(borderBottom('2px')).toEqual({
      borderBottom: '2px',
    });
  });

  it('for a given style', () => {
    expect(borderBottom('none')).toEqual({
      borderBottom: 'none',
    });
  });

  it('for a given width and style', () => {
    expect(borderBottom('2px', 'solid')).toEqual({
      borderBottom: '2px solid',
    });
  });

  it('for a given style and width', () => {
    expect(borderBottom('solid', '2px')).toEqual({
      borderBottom: 'solid 2px',
    });
  });

  it('for a given width, style and color', () => {
    expect(borderBottom('2px', 'solid', 'red')).toEqual({
      borderBottom: '2px solid red',
    });
  });

  it('for a given style, width and color', () => {
    expect(borderBottom('solid', '2px', 'red')).toEqual({
      borderBottom: 'solid 2px red',
    });
  });

  it('for fallback value arrays', () => {
    expect(borderBottom(['2px', '4px'], ['solid', 'dashed'], ['red', 'green'])).toEqual({
      borderBottomColor: ['red', 'green'],
      borderBottomStyle: ['solid', 'dashed'],
      borderBottomWidth: ['2px', '4px'],
    });
  });
});
