import { GriffelRenderer, IsomorphicCSSStyleSheet, StyleBucketName } from '../types';
import { createIsomorphicStyleElement } from './createIsomorphicStyleElement';

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
  // media rules
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
): IsomorphicCSSStyleSheet {
  if (!renderer.styleElements[bucketName]) {
    const tag = createIsomorphicStyleElement(target);

    tag.dataset['makeStylesBucket'] = bucketName;

    for (const attribute in elementAttributes) {
      tag.setAttribute(attribute, elementAttributes[attribute]);
    }

    if (bucketName === 'm' && metadata) {
      tag.media = metadata['m'] as string;
    }

    renderer.styleElements[bucketName] = tag;

    if (target) {
      const tags = target.head.querySelectorAll<HTMLStyleElement>('[data-make-styles-bucket]');
      const sibling = getStyleElementSibling(bucketName, Array.from(tags));

      if (sibling) {
        target.head.insertBefore(tag as unknown as HTMLStyleElement, sibling);
      } else {
        target.head.appendChild(tag as unknown as HTMLStyleElement);
      }
    }
  }

  return renderer.styleElements[bucketName]!.sheet;
}

export function getStyleElementSibling(targetBucketName: string, styleElements: HTMLStyleElement[]) {
  const targetBucketIndex = styleBucketOrdering.indexOf(targetBucketName as StyleBucketName);

  let nextBucket = null;
  let currentIndex = 0;

  for (; currentIndex < styleElements.length; currentIndex++) {
    const styleElement = styleElements[currentIndex];

    const currentBucketName = styleElement.dataset['makeStylesBucket'] as StyleBucketName;
    const currentBucketIndex = styleBucketOrdering.indexOf(currentBucketName);

    if (currentBucketIndex >= targetBucketIndex) {
      nextBucket = styleElement;
      break;
    }
  }

  if (targetBucketName === 'm') {
    return null;
  }

  return nextBucket;
}
