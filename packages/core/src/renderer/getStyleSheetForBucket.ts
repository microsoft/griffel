import { DATA_BUCKET_ATTR, DATA_CONTAINER_ATTR, DATA_PRIORITY_ATTR } from '../constants.js';
import type { GriffelRenderer, IsomorphicStyleSheet, StyleBucketName } from '../types.js';
import { createIsomorphicStyleSheet } from './createIsomorphicStyleSheet.js';

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
  // @container rules (legacy/shared)
  'c',
  // @container rules (sorted)
  'x',
];

// avoid repeatedly calling `indexOf` to determine order during new insertions
const styleBucketOrderingMap = /*#__PURE__*/ styleBucketOrdering.reduce(
  (acc, cur, j) => {
    acc[cur as StyleBucketName] = j;
    return acc;
  },
  {} as Record<StyleBucketName, number>,
);

export function getStyleSheetKey(bucketName: StyleBucketName, mediaValue: string, priority: number | string): string {
  if (bucketName === 'm' || bucketName === 'x') {
    return bucketName + mediaValue + priority;
  }

  return bucketName + priority;
}

export function getStyleSheetKeyFromElement(styleEl: HTMLStyleElement): string {
  const bucketName = styleEl.getAttribute(DATA_BUCKET_ATTR) as StyleBucketName;
  const priority = styleEl.getAttribute(DATA_PRIORITY_ATTR) ?? '0';
  const container = styleEl.getAttribute(DATA_CONTAINER_ATTR);

  return getStyleSheetKey(bucketName, container ?? (styleEl.media || '0'), priority);
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
  const isContainerBucket = bucketName === 'x';

  const media = metadata['m'] as string | undefined;
  const container = metadata['x'] as string | undefined;
  const priority = (metadata['p'] as number | undefined) ?? 0;

  const stylesheetKey = getStyleSheetKey(bucketName, container ?? media ?? '0', priority);

  if (!renderer.stylesheets[stylesheetKey]) {
    const tag: HTMLStyleElement | undefined = targetDocument && targetDocument.createElement('style');
    const stylesheet = createIsomorphicStyleSheet(tag, bucketName, priority, {
      ...renderer.styleElementAttributes,
      ...(isMediaBucket && { media }),
      ...(isContainerBucket && { [DATA_CONTAINER_ATTR]: container }),
    });

    renderer.stylesheets[stylesheetKey] = stylesheet;

    if (targetDocument?.head && tag) {
      targetDocument.head.insertBefore(
        tag,
        findInsertionPoint(targetDocument, insertionPoint, bucketName, renderer, metadata),
      );
    }
  }

  return renderer.stylesheets[stylesheetKey]!;
}

export function isSameInsertionKey(
  elementA: HTMLStyleElement,
  bucketNameB: StyleBucketName,
  metadataB: Record<string, unknown>,
): boolean {
  // The bucket name is the key; only "@media" / "@container" buckets append a condition, each from the
  // field that matches its bucket (mirroring "getStyleSheetKey").
  const elementBucketA = elementA.getAttribute(DATA_BUCKET_ATTR);
  const isSameBucket = elementBucketA === bucketNameB;

  if (isSameBucket) {
    if (bucketNameB === 'm') {
      return metadataB['m'] === elementA.media;
    }

    if (bucketNameB === 'x') {
      return metadataB['x'] === elementA.getAttribute(DATA_CONTAINER_ATTR);
    }

    return true;
  }

  return false;
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
  const container = (metadata['x'] as string | undefined) ?? '';
  const priority = (metadata['p'] as number | undefined) ?? 0;

  // Similar to javascript sort comparators where
  // a positive value is increasing sort order
  // a negative value is decreasing sort order
  let comparer: (el: HTMLStyleElement) => number = el =>
    targetOrder - styleBucketOrderingMap[el.getAttribute(DATA_BUCKET_ATTR) as StyleBucketName];
  let styleElements = targetDocument.head.querySelectorAll<HTMLStyleElement>(`[${DATA_BUCKET_ATTR}]`);

  // "@media" and "@container" rules are split into per-condition sheets that must be ordered by
  // their condition (ascending min-width) rather than plain insertion order.
  if (targetBucket === 'm' || targetBucket === 'x') {
    const conditionElements = targetDocument.head.querySelectorAll<HTMLStyleElement>(
      `[${DATA_BUCKET_ATTR}="${targetBucket}"]`,
    );

    // only reduce the scope of the search and change comparer
    // if there are other buckets of the same kind already on the page
    if (conditionElements.length) {
      styleElements = conditionElements;
      comparer =
        targetBucket === 'm'
          ? (el: HTMLStyleElement) => renderer.compareMediaQueries(media, el.media)
          : (el: HTMLStyleElement) =>
              renderer.compareContainerQueries(container, el.getAttribute(DATA_CONTAINER_ATTR) ?? '');
    }
  }

  const comparerWithPriority: (el: HTMLStyleElement) => number = el => {
    if (isSameInsertionKey(el, targetBucket, metadata)) {
      return priority - Number(el.getAttribute(DATA_PRIORITY_ATTR));
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
