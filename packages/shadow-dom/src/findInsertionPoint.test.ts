import type { StyleBucketName } from '@griffel/core';

import { findInsertionPoint } from './findInsertionPoint';
import type { ExtendedCSSStyleSheet, GriffelShadowDOMRenderer } from './types';

function createRendererMock(adoptedStyleSheets: ExtendedCSSStyleSheet[]) {
  const mediaQueryOrder = ['(max-width: 1px)', '(max-width: 2px)', '(max-width: 3px)', '(max-width: 4px)'];
  const renderer: Partial<GriffelShadowDOMRenderer> = {
    adoptedStyleSheets,
    compareMediaQueries(a, b) {
      return mediaQueryOrder.indexOf(a) - mediaQueryOrder.indexOf(b);
    },
  };

  return renderer as GriffelShadowDOMRenderer;
}

function createStyleSheetMock(bucketName: StyleBucketName, metadata: Record<string, unknown>) {
  const sheet = new CSSStyleSheet() as ExtendedCSSStyleSheet;

  sheet.bucketName = bucketName;
  sheet.metadata = metadata;

  return sheet;
}

describe('findInsertionPoint', () => {
  it('finds a position in empty array', () => {
    const renderer = createRendererMock([]);
    const styleSheet = createStyleSheetMock('d', {});

    expect(findInsertionPoint(renderer, styleSheet)).toBe(null);
  });

  it('finds a position at beginning', () => {
    const renderer = createRendererMock([createStyleSheetMock('d', {}), createStyleSheetMock('a', {})]);
    const styleSheet = createStyleSheetMock('r', {});

    expect(findInsertionPoint(renderer, styleSheet)).toBe(null);
  });

  it('finds a position in middle', () => {
    const renderer = createRendererMock([createStyleSheetMock('d', {}), createStyleSheetMock('a', {})]);
    const styleSheet = createStyleSheetMock('h', {});

    expect(findInsertionPoint(renderer, styleSheet)).toHaveProperty('bucketName', 'd');
  });

  it('finds a position at end', () => {
    const renderer = createRendererMock([createStyleSheetMock('d', {}), createStyleSheetMock('a', {})]);
    const styleSheet = createStyleSheetMock('t', {});

    expect(findInsertionPoint(renderer, styleSheet)).toHaveProperty('bucketName', 'a');
  });

  describe('media queries', () => {
    it('finds a position in empty array', () => {
      const renderer = createRendererMock([]);
      const styleSheet = createStyleSheetMock('m', { m: '(max-width: 3px)' });

      expect(findInsertionPoint(renderer, styleSheet)).toBe(null);
    });

    it('finds a position at beginning', () => {
      const renderer = createRendererMock([createStyleSheetMock('c', {})]);
      const styleSheet = createStyleSheetMock('m', { m: '(max-width: 3px)' });

      expect(findInsertionPoint(renderer, styleSheet)).toBe(null);
    });

    it('finds a position in middle', () => {
      const renderer = createRendererMock([createStyleSheetMock('t', {}), createStyleSheetMock('c', {})]);
      const styleSheet = createStyleSheetMock('m', { m: '(max-width: 3px)' });

      expect(findInsertionPoint(renderer, styleSheet)).toHaveProperty('bucketName', 't');
    });

    it('finds a position at end', () => {
      const renderer = createRendererMock([createStyleSheetMock('d', {}), createStyleSheetMock('a', {})]);
      const styleSheet = createStyleSheetMock('m', { m: '(max-width: 3px)' });

      expect(findInsertionPoint(renderer, styleSheet)).toHaveProperty('bucketName', 'a');
    });

    it('finds a position in media queries', () => {
      const renderer = createRendererMock([
        createStyleSheetMock('d', {}),
        createStyleSheetMock('t', {}),
        createStyleSheetMock('m', { m: '(max-width: 1px)' }),
        createStyleSheetMock('m', { m: '(max-width: 3px)' }),
        createStyleSheetMock('c', {}),
      ]);

      const resultA = findInsertionPoint(renderer, createStyleSheetMock('m', { m: '(max-width: 2px)' }));

      expect(resultA).toHaveProperty('bucketName', 'm');
      expect(resultA).toHaveProperty('metadata.m', '(max-width: 1px)');

      const resultB = findInsertionPoint(renderer, createStyleSheetMock('m', { m: '(max-width: 4px)' }));

      expect(resultB).toHaveProperty('bucketName', 'm');
      expect(resultB).toHaveProperty('metadata.m', '(max-width: 3px)');
    });
  });
});
