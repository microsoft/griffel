import { DATA_BUCKET_ATTR } from '../constants';
import { GriffelRenderer, IsomorphicStyleSheet, StyleBucketName } from '../types';
import { createIsomorphicStyleSheet } from './createIsomorphicStyleSheet';

/**
 * Ordered style buckets using their short pseudo name.
 *
 * @private
 */
export const styleBucketOrdering: StyleBucketName[] = [
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
  // keyframes
  'k',
  // at-rules
  't',
  // @media rules
  'm',
];

/**
 * Lazily adds a `<style>` bucket to the `<head>`. This will ensure that the style buckets are ordered.
 */
export function getStyleSheetForBucket(
  bucketName: StyleBucketName,
  target: Document | undefined,
  renderer: GriffelRenderer,
  elementAttributes: Record<string, string> = {},
  metadata?: Record<string, unknown>,
): IsomorphicStyleSheet {
  let stylesheetKey: StyleBucketName | string = bucketName;

  if (bucketName === 'm' && metadata) {
    stylesheetKey = (bucketName + metadata['m']) as string;
  }

  if (!renderer.stylesheets[stylesheetKey]) {
    const tag: HTMLStyleElement | undefined = target && target.createElement('style');

    if (bucketName === 'm' && metadata) {
      elementAttributes['media'] = metadata['m'] as string;
    }

    const stylesheet = createIsomorphicStyleSheet(tag, bucketName, elementAttributes);
    renderer.stylesheets[stylesheetKey] = stylesheet;

    if (target && tag) {
      const elementSibling = findElementSibling(target, bucketName, renderer, metadata);
      target.head.insertBefore(tag, elementSibling);
    }
  }

  return renderer.stylesheets[stylesheetKey]!;
}

/**
 * Finds an element before which the new bucket style element should be inserted following the
 * bucket sort order
 *
 * @param target - document
 * @param targetBucket - The bucket that should be inserted to DOM
 * @param renderer - Griffel renderer
 * @param metadata - metadata for CSS rule
 * @returns - Smallest style element with greater sort order than the current bucket
 */
function findElementSibling(
  target: Document,
  targetBucket: StyleBucketName,
  renderer: GriffelRenderer,
  metadata?: Record<string, unknown>,
) {
  // avoid repeatedly calling `indexOf`to determine order
  const styleBucketOrderingMap = styleBucketOrdering.reduce((acc, cur, j) => {
    acc[cur as StyleBucketName] = j;
    return acc;
  }, {} as Record<StyleBucketName, number>);
  const targetOrder = styleBucketOrderingMap[targetBucket];

  // Similar to javascript sort comparators where
  // a positive value is increasing sort order
  // a negative value is decreasing sort order
  let comparer: (el: HTMLStyleElement) => number = (el: HTMLStyleElement) =>
    targetOrder - styleBucketOrderingMap[el.getAttribute(DATA_BUCKET_ATTR) as StyleBucketName];

  let styleElements = target.head.querySelectorAll<HTMLStyleElement>(`[${DATA_BUCKET_ATTR}]`);

  if (targetBucket === 'm' && metadata) {
    const mediaElements = target.head.querySelectorAll<HTMLStyleElement>(`[${DATA_BUCKET_ATTR}="${targetBucket}"]`);
    // only reduce the scope of the search and change comparer
    // if there are other media buckets already on the page
    if (mediaElements.length) {
      styleElements = mediaElements;
      comparer = (el: HTMLStyleElement) => renderer.compareMediaQueries(metadata['m'] as string, el.media);
    }
  }

  for (const styleElement of styleElements) {
    if (comparer(styleElement) < 0) {
      return styleElement;
    }
  }

  return null;
}
