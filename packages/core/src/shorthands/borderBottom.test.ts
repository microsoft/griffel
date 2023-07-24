import { borderBottom } from './borderBottom';

describe('borderBottom', () => {
  it('for a given width', () => {
    expect(borderBottom('2px')).toEqual({
      borderBottomWidth: '2px',
    });
  });

  it('for a given style', () => {
    expect(borderBottom('none')).toEqual({
      borderBottomStyle: 'none',
    });
  });

  it('for a given width and style', () => {
    expect(borderBottom('2px', 'solid')).toEqual({
      borderBottomWidth: '2px',
      borderBottomStyle: 'solid',
    });
  });

  it('for a given style and width', () => {
    expect(borderBottom('solid', '2px')).toEqual({
      borderBottomWidth: '2px',
      borderBottomStyle: 'solid',
    });
  });

  it('for a given width, style and color', () => {
    expect(borderBottom('2px', 'solid', 'red')).toEqual({
      borderBottomWidth: '2px',
      borderBottomStyle: 'solid',
      borderBottomColor: 'red',
    });
  });

  it('for a given style, width and color', () => {
    expect(borderBottom('solid', '2px', 'red')).toEqual({
      borderBottomStyle: 'solid',
      borderBottomWidth: '2px',
      borderBottomColor: 'red',
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
