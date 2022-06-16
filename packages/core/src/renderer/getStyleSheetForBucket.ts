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
];

/**
 * Lazily adds a `<style>` bucket to the `<head>`. This will ensure that the style buckets are ordered.
 */
export function getStyleSheetForBucket(
  bucketName: StyleBucketName,
  target: Document | undefined,
  renderer: GriffelRenderer,
  elementAttributes: Record<string, string> = {},
): IsomorphicStyleSheet {
  if (!renderer.styleElements[bucketName]) {
    const stylesheet = createIsomorphicStyleSheet(target, bucketName, elementAttributes);
    renderer.styleElements[bucketName] = stylesheet;

    if (target) {
      const tags = target.head.querySelectorAll<HTMLStyleElement>(`[${DATA_BUCKET_ATTR}]`);
      const styleElement = stylesheet.element;
      const sibling = getStyleElementSibling(bucketName, Array.from(tags));

      if (sibling) {
        target.head.insertBefore(styleElement!, sibling);
      } else {
        target.head.appendChild(styleElement!);
      }
    }
  }

  return renderer.styleElements[bucketName]!;
}

export function getStyleElementSibling(targetBucketName: string, styleElements: HTMLStyleElement[]) {
  const targetBucketIndex = styleBucketOrdering.indexOf(targetBucketName as StyleBucketName);

  let nextBucket = null;
  let currentIndex = 0;

  for (; currentIndex < styleElements.length; currentIndex++) {
    const styleElement = styleElements[currentIndex];

    const currentBucketName = styleElement.getAttribute(DATA_BUCKET_ATTR) as StyleBucketName;
    const currentBucketIndex = styleBucketOrdering.indexOf(currentBucketName);

    if (currentBucketIndex >= targetBucketIndex) {
      nextBucket = styleElement;
      break;
    }
  }

  return nextBucket;
}
