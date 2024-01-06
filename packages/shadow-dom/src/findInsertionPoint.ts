import { styleBucketOrdering } from '@griffel/core';
import type { StyleBucketName } from '@griffel/core';

import type { ExtendedCSSStyleSheet, GriffelShadowDOMRenderer } from './types';

const styleBucketOrderingMap = styleBucketOrdering.reduce((acc, cur, j) => {
  acc[cur as StyleBucketName] = j;
  return acc;
}, {} as Record<StyleBucketName, number>);

export function findInsertionPoint(
  renderer: GriffelShadowDOMRenderer,
  styleSheet: ExtendedCSSStyleSheet,
  insertionPoint?: ExtendedCSSStyleSheet,
): ExtendedCSSStyleSheet | null {
  let styleSheets = renderer.adoptedStyleSheets;
  const targetOrder = styleBucketOrderingMap[styleSheet.bucketName];

  let comparer = (sheet: ExtendedCSSStyleSheet): number => targetOrder - styleBucketOrderingMap[sheet.bucketName];

  if (styleSheet.bucketName === 'm' && styleSheet.metadata) {
    const mediaElements = renderer.adoptedStyleSheets.filter(styleSheet => styleSheet.bucketName === 'm');

    if (mediaElements.length) {
      styleSheets = mediaElements;
      comparer = sheet =>
        renderer.compareMediaQueries(styleSheet.metadata['m'] as string, sheet.metadata['m'] as string);
    }
  }

  for (let l = styleSheets.length, i = l - 1; i >= 0; i--) {
    const styleElement = styleSheets[i];

    if (comparer(styleElement) > 0) {
      return styleSheets[i + 1] ?? insertionPoint ?? null;
    }
  }

  if (insertionPoint) {
    return insertionPoint;
  }

  if (styleSheets.length > 0) {
    return styleSheets[0];
  }

  return null;
}
