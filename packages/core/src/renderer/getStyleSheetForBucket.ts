import { DATA_BUCKET_ATTR, DATA_PRIORITY_ATTR } from '../constants';
import type { GriffelRenderer, IsomorphicStyleSheet, StyleBucketName } from '../types';
import { createIsomorphicStyleSheet } from './createIsomorphicStyleSheet';

/**
 * Ordered style buckets using their short pseudo name.
 *
 * @internal
 */
export const styleBucketOrdering: StyleBucketName[] = [
  // reset styles
  'r',
  // catch-all
  'd',
  // link
  'l',
  // visited
  'v',
  // focus-within
  'w',
  // focus
  'f',
  // focus-visible
  'i',
  // hover
  'h',
  // active
  'a',
  // at rules for reset styles
  's',
  // keyframes
  'k',
  // at-rules
  't',
  // @media rules
  'm',
  // @container rules
  'c',
];

// avoid repeatedly calling `indexOf` to determine order during new insertions
const styleBucketOrderingMap = styleBucketOrdering.reduce((acc, cur, j) => {
  acc[cur as StyleBucketName] = j;
  return acc;
}, {} as Record<StyleBucketName, number>);

export function getStyleSheetKey(bucketName: StyleBucketName, media: string, priority: number | string): string {
  return (bucketName === 'm' ? bucketName + media : bucketName) + priority;
}

export function getStyleSheetKeyFromElement(styleEl: HTMLStyleElement): string {
  const bucketName = styleEl.getAttribute(DATA_BUCKET_ATTR) as StyleBucketName;
  const priority = styleEl.getAttribute(DATA_PRIORITY_ATTR) ?? '0';

  return getStyleSheetKey(bucketName, styleEl.media, priority);
}

/**
 * Lazily adds a `<style>` bucket to the `<head>`. This will ensure that the style buckets are ordered.
 */
export function getStyleSheetForBucket(
  bucketName: StyleBucketName,
  targetDocument: Document | undefined,
  insertionPoint: HTMLElement | null,
  renderer: GriffelRenderer,
  metadata: Record<string, unknown> = {},
): IsomorphicStyleSheet {
  const isMediaBucket = bucketName === 'm';

  const media = (metadata['m'] as string | undefined) ?? '0';
  const priority = (metadata['p'] as number | undefined) ?? 0;

  const stylesheetKey = getStyleSheetKey(bucketName, media, priority);

  if (!renderer.stylesheets[stylesheetKey]) {
    const tag: HTMLStyleElement | undefined = targetDocument && targetDocument.createElement('style');
    const stylesheet = createIsomorphicStyleSheet(tag, bucketName, priority, {
      ...renderer.styleElementAttributes,
      ...(isMediaBucket && { media }),
    });

    renderer.stylesheets[stylesheetKey] = stylesheet;

    if (targetDocument && tag) {
      targetDocument.head.insertBefore(
        tag,
        findInsertionPoint(targetDocument, insertionPoint, bucketName, renderer, metadata),
      );
    }
  }

  return renderer.stylesheets[stylesheetKey]!;
}

function isSameInsertionKey(
  element: HTMLStyleElement,
  bucketName: StyleBucketName,
  metadata: Record<string, unknown>,
): boolean {
  const targetKey = bucketName + ((metadata['m'] as string | undefined) ?? '');
  const elementKey = element.getAttribute(DATA_BUCKET_ATTR) + (element.media ?? '');

  return targetKey === elementKey;
}

/**
 * Finds an element before which the new bucket style element should be inserted following the bucket sort order.
 *
 * @param targetDocument - A document
 * @param insertionPoint - An element that will be used as an initial insertion point
 * @param targetBucket - The bucket that should be inserted to DOM
 * @param renderer - Griffel renderer
 * @param metadata - metadata for CSS rule
 * @returns - Smallest style element with greater sort order than the current bucket
 */
function findInsertionPoint(
  targetDocument: Document,
  insertionPoint: HTMLElement | null,
  targetBucket: StyleBucketName,
  renderer: GriffelRenderer,
  metadata: Record<string, unknown> = {},
): Node | null {
  const targetOrder = styleBucketOrderingMap[targetBucket];

  const media = (metadata['m'] as string | undefined) ?? '';
  const priority = (metadata['p'] as number | undefined) ?? 0;

  // Similar to javascript sort comparators where
  // a positive value is increasing sort order
  // a negative value is decreasing sort order
  let comparer: (el: HTMLStyleElement) => number = el =>
    targetOrder - styleBucketOrderingMap[el.getAttribute(DATA_BUCKET_ATTR) as StyleBucketName];
  let styleElements = targetDocument.head.querySelectorAll<HTMLStyleElement>(`[${DATA_BUCKET_ATTR}]`);

  if (targetBucket === 'm') {
    const mediaElements = targetDocument.head.querySelectorAll<HTMLStyleElement>(
      `[${DATA_BUCKET_ATTR}="${targetBucket}"]`,
    );

    // only reduce the scope of the search and change comparer
    // if there are other media buckets already on the page
    if (mediaElements.length) {
      styleElements = mediaElements;
      comparer = (el: HTMLStyleElement) => renderer.compareMediaQueries(media, el.media);
    }
  }

  const comparerWithPriority: (el: HTMLStyleElement) => number = el => {
    if (isSameInsertionKey(el, targetBucket, metadata)) {
      return priority - Number(el.getAttribute('data-priority'));
    }

    return comparer(el);
  };

  const length = styleElements.length;
  let index = length - 1;

  while (index >= 0) {
    const styleElement = styleElements.item(index);

    if (comparerWithPriority(styleElement) > 0) {
      return styleElement.nextSibling;
    }

    index--;
  }

  if (length > 0) {
    return styleElements.item(0);
  }

  return insertionPoint ? insertionPoint.nextSibling : null;
}
