import { buildShorthandSplitter } from './buildShorthandSplitter';

describe('buildShorthandSplitter', () => {
  test('should convert numbers to px', () => {
    const pxSplitter = buildShorthandSplitter({ numberUnit: 'px' });
    expect(pxSplitter('1 2 3 4')).toEqual(['1', '2', '3', '4']);
    expect(pxSplitter(10)).toEqual(['10px']);
    expect(pxSplitter(15)).toEqual(['15px']);
    expect(pxSplitter(0)).toEqual(['0']);
  });

  test('should split around spaces', () => {
    const splitter = buildShorthandSplitter();
    expect(splitter('1px solid black')).toEqual(['1px', 'solid', 'black']);
    expect(splitter('1px solid')).toEqual(['1px', 'solid']);
    expect(splitter('1px')).toEqual(['1px']);
    expect(splitter('1 2 30px')).toEqual(['1', '2', '30px']);
  });

  test('should split around slashes', () => {
    const splitter = buildShorthandSplitter({ separator: '/' });
    expect(splitter('1 icon / span 2')).toEqual(['1 icon', 'span 2']);
    expect(splitter('span 2')).toEqual(['span 2']);
  });

  test('should not split CSS functions', () => {
    const splitter = buildShorthandSplitter();
    expect(splitter('var(--color) rgba(0 0 0 / 0.5) rgb(0, 0, 0)')).toEqual([
      'var(--color)',
      'rgba(0 0 0 / 0.5)',
      'rgb(0, 0, 0)',
    ]);
    expect(splitter('var(--color)   rgba(0   0 0 /  0.5) rgb(0,  0, 0)')).toEqual([
      'var(--color)',
      'rgba(0   0 0 /  0.5)',
      'rgb(0,  0, 0)',
    ]);
    expect(splitter('var(--color, var(--fallback)) rgba(0 0 0 / 0.5) rgb(0, 0, 0)  ')).toEqual([
      'var(--color, var(--fallback))',
      'rgba(0 0 0 / 0.5)',
      'rgb(0, 0, 0)',
    ]);
  });
});
