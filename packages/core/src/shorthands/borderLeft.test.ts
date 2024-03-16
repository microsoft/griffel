import { borderLeft } from './borderLeft';

describe('borderLeft', () => {
  it('for a given width', () => {
    expect(borderLeft('2px')).toEqual({
      borderLeft: '2px',
    });
  });

  it('for a given style', () => {
    expect(borderLeft('none')).toEqual({
      borderLeft: 'none',
    });
  });

  it('for a given width and style', () => {
    expect(borderLeft('2px', 'solid')).toEqual({
      borderLeft: '2px solid',
    });
  });

  it('for a given style and width', () => {
    expect(borderLeft('solid', '2px')).toEqual({
      borderLeft: 'solid 2px',
    });
  });

  it('for a given width, style and color', () => {
    expect(borderLeft('2px', 'solid', 'red')).toEqual({
      borderLeft: '2px solid red',
    });
  });

  it('for a given style, width and color', () => {
    expect(borderLeft('solid', '2px', 'red')).toEqual({
      borderLeft: 'solid 2px red',
    });
  });

  it('for fallback value arrays', () => {
    expect(borderLeft(['2px', '4px'], ['solid', 'dashed'], ['red', 'green'])).toEqual({
      borderLeftColor: ['red', 'green'],
      borderLeftStyle: ['solid', 'dashed'],
      borderLeftWidth: ['2px', '4px'],
    });
  });
});
