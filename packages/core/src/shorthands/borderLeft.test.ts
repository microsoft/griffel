import { borderLeft } from './borderLeft';

describe('borderLeft', () => {
  it('for a given width', () => {
    expect(borderLeft('2px')).toEqual({
      borderLeftWidth: '2px',
    });
  });

  it('for a given style', () => {
    expect(borderLeft('none')).toEqual({
      borderLeftStyle: 'none',
    });
  });

  it('for a given width and style', () => {
    expect(borderLeft('2px', 'solid')).toEqual({
      borderLeftWidth: '2px',
      borderLeftStyle: 'solid',
    });
  });

  it('for a given style and width', () => {
    expect(borderLeft('solid', '2px')).toEqual({
      borderLeftWidth: '2px',
      borderLeftStyle: 'solid',
    });
  });

  it('for a given width, style and color', () => {
    expect(borderLeft('2px', 'solid', 'red')).toEqual({
      borderLeftWidth: '2px',
      borderLeftStyle: 'solid',
      borderLeftColor: 'red',
    });
  });

  it('for a given style, width and color', () => {
    expect(borderLeft('solid', '2px', 'red')).toEqual({
      borderLeftStyle: 'solid',
      borderLeftWidth: '2px',
      borderLeftColor: 'red',
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
