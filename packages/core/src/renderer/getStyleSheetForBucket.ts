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
    stylesheetKey = metadata['m'] as string;
  }

  if (!renderer.stylesheets[stylesheetKey]) {
    const tag: HTMLStyleElement | undefined = target && target.createElement('style');
    if (bucketName === 'm' && metadata) {
      elementAttributes['media'] = metadata['m'] as string;
    }
    const stylesheet = createIsomorphicStyleSheet(tag, bucketName, elementAttributes);

    renderer.stylesheets[stylesheetKey] = stylesheet;

    if (target && tag) {
      let currentBucketIndex = styleBucketOrdering.indexOf(bucketName) + 1;
      let nextBucketFromCache = null;

      // Find the next bucket which we will add our new style bucket before.
      for (; currentBucketIndex < styleBucketOrdering.length; currentBucketIndex++) {
        const nextBucket = renderer.stylesheets[styleBucketOrdering[currentBucketIndex]];
        if (nextBucket) {
          nextBucketFromCache = nextBucket;
          break;
        }
      }

      target.head.insertBefore(tag, nextBucketFromCache?.element || null);
    }
  }

  return renderer.stylesheets[stylesheetKey]!;
}
