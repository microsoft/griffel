import { styleBucketOrdering } from '@griffel/core';
import type { StyleBucketName } from '@griffel/core';

import type { ExtendedCSSStyleSheet, GriffelShadowDOMRenderer } from './types';

const styleBucketOrderingMap = styleBucketOrdering.reduce((acc, cur, j) => {
  acc[cur as StyleBucketName] = j;
  return acc;
}, {} as Record<StyleBucketName, number>);

function isSameInsertionKey(sheetA: ExtendedCSSStyleSheet, sheetB: ExtendedCSSStyleSheet): boolean {
  const targetKey = sheetA.bucketName + ((sheetA.metadata['m'] as string | undefined) ?? '');
  const elementKey = sheetB.bucketName + ((sheetB.metadata['m'] as string | undefined) ?? '');

  return targetKey === elementKey;
}

export function findInsertionPoint(
  renderer: GriffelShadowDOMRenderer,
  targetStyleSheet: ExtendedCSSStyleSheet,
): ExtendedCSSStyleSheet | null {
  let styleSheets = renderer.adoptedStyleSheets;

  const targetOrder = styleBucketOrderingMap[targetStyleSheet.bucketName];
  const targetPriority = (targetStyleSheet.metadata['p'] as number | undefined) ?? 0;

  let comparer = (sheet: ExtendedCSSStyleSheet): number => targetOrder - styleBucketOrderingMap[sheet.bucketName];

  if (targetStyleSheet.bucketName === 'm' && targetStyleSheet.metadata) {
    const mediaElements = renderer.adoptedStyleSheets.filter(styleSheet => styleSheet.bucketName === 'm');

    if (mediaElements.length) {
      styleSheets = mediaElements;
      comparer = sheet =>
        renderer.compareMediaQueries(targetStyleSheet.metadata['m'] as string, sheet.metadata['m'] as string);
    }
  }

  const comparerWithPriority = (sheet: ExtendedCSSStyleSheet): number => {
    if (isSameInsertionKey(sheet, targetStyleSheet)) {
      return targetPriority - ((sheet.metadata['p'] as number | undefined) ?? 0);
    }

    return comparer(sheet);
  };

  for (let l = styleSheets.length, i = l - 1; i >= 0; i--) {
    const styleSheet = styleSheets[i];

    if (comparerWithPriority(styleSheet) > 0) {
      return styleSheets[i + 1] ?? null;
    }
  }

  if (styleSheets.length > 0) {
    return styleSheets[0];
  }

  return null;
}

export function findShadowRootInsertionPoint(
  shadowRoot: ShadowRoot,
  rendererTargetStyleSheet: ExtendedCSSStyleSheet | null,
  insertionPoint?: CSSStyleSheet,
): CSSStyleSheet | null {
  const styleSheets = shadowRoot.adoptedStyleSheets;

  if (rendererTargetStyleSheet) {
    return styleSheets[styleSheets.indexOf(rendererTargetStyleSheet)] ?? null;
  }

  if (insertionPoint) {
    let i = styleSheets.indexOf(insertionPoint) + 1;
    let targetSheet = styleSheets[i];
    while (targetSheet && 'bucketName' in targetSheet) {
      targetSheet = styleSheets[i++];
    }

    return targetSheet ?? null;
  }

  return null;
}
