import { borderTop } from './borderTop';

describe('borderTop', () => {
  it('for a given width', () => {
    expect(borderTop('2px')).toEqual({
      borderTopWidth: '2px',
    });
  });

  it('for a given width and style', () => {
    expect(borderTop('2px', 'solid')).toEqual({
      borderTopWidth: '2px',
      borderTopStyle: 'solid',
    });
  });

  it('for a given width, style and color', () => {
    expect(borderTop('2px', 'solid', 'red')).toEqual({
      borderTopWidth: '2px',
      borderTopStyle: 'solid',
      borderTopColor: 'red',
    });
  });

  it('for fallback value arrays', () => {
    expect(borderTop(['2px', '4px'], ['solid', 'dashed'], ['red', 'green'])).toEqual({
      borderTopColor: ['red', 'green'],
      borderTopStyle: ['solid', 'dashed'],
      borderTopWidth: ['2px', '4px'],
    });
  });
});
