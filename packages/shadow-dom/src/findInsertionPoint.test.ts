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

  it('handles insertionPoint in otherwise empty array', () => {
    const insertionPoint = new CSSStyleSheet() as ExtendedCSSStyleSheet;

    const renderer = createRendererMock([insertionPoint]);
    const styleSheet = createStyleSheetMock('d', {});

    expect(findInsertionPoint(renderer, styleSheet, insertionPoint)).toBe(insertionPoint);
  });

  it('handles insertionPoint with other (non-Griffel) stylesheets', () => {
    const insertionPoint = new CSSStyleSheet() as ExtendedCSSStyleSheet;
    const other1 = new CSSStyleSheet() as ExtendedCSSStyleSheet;
    const other2 = new CSSStyleSheet() as ExtendedCSSStyleSheet;

    const renderer = createRendererMock([other1, insertionPoint, other2]);
    const styleSheet = createStyleSheetMock('d', {});

    expect(findInsertionPoint(renderer, styleSheet, insertionPoint)).toBe(insertionPoint);
  });

  it('finds a position at beginning', () => {
    const renderer = createRendererMock([
      createStyleSheetMock('d', {}),
      createStyleSheetMock('a', {}),
      createStyleSheetMock('t', {}),
    ]);
    const styleSheet = createStyleSheetMock('r', {});

    expect(findInsertionPoint(renderer, styleSheet)).toHaveProperty('bucketName', 'd');
  });

  it('finds a position in middle', () => {
    const renderer = createRendererMock([createStyleSheetMock('d', {}), createStyleSheetMock('t', {})]);
    const styleSheet = createStyleSheetMock('h', {});

    expect(findInsertionPoint(renderer, styleSheet)).toHaveProperty('bucketName', 't');
  });

  it('finds a position at end', () => {
    const renderer = createRendererMock([createStyleSheetMock('d', {}), createStyleSheetMock('a', {})]);
    const styleSheet = createStyleSheetMock('t', {});

    expect(findInsertionPoint(renderer, styleSheet)).toBe(null);
  });

  describe('media queries', () => {
    it('finds a position in empty array', () => {
      const renderer = createRendererMock([]);
      const styleSheet = createStyleSheetMock('m', { m: '(max-width: 3px)' });

      expect(findInsertionPoint(renderer, styleSheet)).toBe(null);
    });

    it('handles insertionPoint in otherwise empty array', () => {
      const insertionPoint = new CSSStyleSheet() as ExtendedCSSStyleSheet;

      const renderer = createRendererMock([insertionPoint]);
      const styleSheet = createStyleSheetMock('m', { m: '(max-width: 3px)' });

      expect(findInsertionPoint(renderer, styleSheet, insertionPoint)).toBe(insertionPoint);
    });

    it('handles insertionPoint with other (non-Griffel) stylesheets', () => {
      const insertionPoint = new CSSStyleSheet() as ExtendedCSSStyleSheet;
      const other1 = new CSSStyleSheet() as ExtendedCSSStyleSheet;
      const other2 = new CSSStyleSheet() as ExtendedCSSStyleSheet;

      const renderer = createRendererMock([other1, insertionPoint, other2]);
      const styleSheet = createStyleSheetMock('m', { m: '(max-width: 3px)' });

      expect(findInsertionPoint(renderer, styleSheet, insertionPoint)).toBe(insertionPoint);
    });

    it('finds a position at beginning', () => {
      const renderer = createRendererMock([createStyleSheetMock('c', {})]);
      const styleSheet = createStyleSheetMock('m', { m: '(max-width: 3px)' });

      expect(findInsertionPoint(renderer, styleSheet)).toHaveProperty('bucketName', 'c');
    });

    it('finds a position in middle', () => {
      const renderer = createRendererMock([createStyleSheetMock('t', {}), createStyleSheetMock('c', {})]);
      const styleSheet = createStyleSheetMock('m', { m: '(max-width: 3px)' });

      expect(findInsertionPoint(renderer, styleSheet)).toHaveProperty('bucketName', 'c');
    });

    it('finds a position at end', () => {
      const renderer = createRendererMock([createStyleSheetMock('d', {}), createStyleSheetMock('a', {})]);
      const styleSheet = createStyleSheetMock('m', { m: '(max-width: 3px)' });

      expect(findInsertionPoint(renderer, styleSheet)).toBe(null);
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
      expect(resultA).toHaveProperty('metadata.m', '(max-width: 3px)');

      const resultB = findInsertionPoint(renderer, createStyleSheetMock('m', { m: '(max-width: 4px)' }));

      expect(resultB).toBe(null);
    });

    it('finds a position in media queries', () => {
      const renderer = createRendererMock([
        createStyleSheetMock('d', {}),
        createStyleSheetMock('t', {}),
        createStyleSheetMock('m', { m: '(prefers-reduced-motion: reduce)' }),
      ]);

      const resultA = findInsertionPoint(renderer, createStyleSheetMock('m', { m: '(forced-colors: active)' }));

      expect(resultA).toHaveProperty('bucketName', 'm');
      expect(resultA).toHaveProperty('metadata.m', '(prefers-reduced-motion: reduce)');
    });
  });
});
