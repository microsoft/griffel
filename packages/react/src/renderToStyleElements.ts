'use client';

import { styleBucketOrdering } from '@griffel/core';
import { createElement } from 'react';
import type { ReactElement } from 'react';
import type { GriffelRenderer } from '@griffel/core';

/**
 * This method returns a list of <style> React elements with the rendered CSS. This is useful for Server-Side rendering.
 *
 * @public
 */
export function renderToStyleElements(renderer: GriffelRenderer): ReactElement[] {
  const stylesheets = Object.values(renderer.stylesheets)
    // first sort: bucket by order [data-priority]
    .sort((a, b) => {
      return Number(a.elementAttributes['data-priority']) - Number(b.elementAttributes['data-priority']);
    })
    // second sort: bucket by bucket name
    .sort((a, b) => {
      return styleBucketOrdering.indexOf(a.bucketName) - styleBucketOrdering.indexOf(b.bucketName);
    })
    // third sort: order conditional sheets within their bucket. The bucket sort above already
    // separates "m" / "c" from each other and from non-conditional buckets, so we only reorder
    // sheets that share the same conditional bucket (relying on a stable sort to preserve the rest).
    .sort((a, b) => {
      if (a.bucketName === 'm' && b.bucketName === 'm') {
        return renderer.compareMediaQueries(a.elementAttributes['media'], b.elementAttributes['media']);
      }

      if (a.bucketName === 'c' && b.bucketName === 'c') {
        return renderer.compareContainerQueries(
          a.elementAttributes['data-container'] ?? '',
          b.elementAttributes['data-container'] ?? '',
        );
      }

      return 0;
    });

  return stylesheets
    .map(stylesheet => {
      const cssRules = stylesheet.cssRules();
      // don't want to create any empty style elements
      if (!cssRules.length) {
        return null;
      }

      return createElement('style', {
        key: stylesheet.bucketName,

        // TODO: support "nonce"
        // ...renderer.styleNodeAttributes,
        ...stylesheet.elementAttributes,
        'data-make-styles-rehydration': 'true',

        dangerouslySetInnerHTML: {
          __html: cssRules.join(''),
        },
      });
    })
    .filter(Boolean) as ReactElement[];
}
