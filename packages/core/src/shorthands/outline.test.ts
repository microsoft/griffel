import { outline } from './outline';
describe('outline', () => {
  it('for a given width', () => {
    expect(outline('2px')).toEqual({
      outlineWidth: '2px',
    });
  });

  it('for a given width and style', () => {
    expect(outline('2px', 'solid')).toEqual({
      outlineWidth: '2px',
      outlineStyle: 'solid',
    });
  });

  it('for a given width, style and color', () => {
    expect(outline('2px', 'solid', 'red')).toEqual({
      outlineWidth: '2px',
      outlineStyle: 'solid',
      outlineColor: 'red',
    });
  });

  it('for fallback value arrays', () => {
    expect(outline(['2px', '4px'], ['solid', 'dashed'], ['red', 'green'])).toEqual({
      outlineColor: ['red', 'green'],
      outlineStyle: ['solid', 'dashed'],
      outlineWidth: ['2px', '4px'],
    });
  });
});
