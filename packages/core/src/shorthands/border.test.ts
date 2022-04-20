import { border } from './border';

describe('border', () => {
  it('for a given width', () => {
    expect(border('2px')).toEqual({
      borderBottomWidth: '2px',
      borderLeftWidth: '2px',
      borderRightWidth: '2px',
      borderTopWidth: '2px',
    });
  });

  it('for a given width and style', () => {
    expect(border('2px', 'solid')).toEqual({
      borderBottomWidth: '2px',
      borderLeftWidth: '2px',
      borderRightWidth: '2px',
      borderTopWidth: '2px',
      borderBottomStyle: 'solid',
      borderLeftStyle: 'solid',
      borderRightStyle: 'solid',
      borderTopStyle: 'solid',
    });
  });

  it('for a given width, style and color', () => {
    expect(border('2px', 'solid', 'red')).toEqual({
      borderBottomWidth: '2px',
      borderLeftWidth: '2px',
      borderRightWidth: '2px',
      borderTopWidth: '2px',
      borderBottomStyle: 'solid',
      borderLeftStyle: 'solid',
      borderRightStyle: 'solid',
      borderTopStyle: 'solid',
      borderBottomColor: 'red',
      borderLeftColor: 'red',
      borderRightColor: 'red',
      borderTopColor: 'red',
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
