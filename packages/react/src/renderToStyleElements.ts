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
  const stylesheets = Object.values(renderer.stylesheets).sort((a, b) => {
    // Primary: bucket order. This keeps "@media" / "@container" sheets grouped, separated from each
    // other, and always placed after regular styles before ordering within a bucket by its condition.
    // It must come first: a user-supplied comparator only understands its own condition strings and
    // can't be trusted to order empty/other-bucket values, so gating by bucket avoids scattering
    // "@container" sheets throughout the output.
    const bucketDiff = styleBucketOrdering.indexOf(a.bucketName) - styleBucketOrdering.indexOf(b.bucketName);
    if (bucketDiff !== 0) {
      return bucketDiff;
    }

    // Within the "@media" bucket, order by media query.
    if (a.bucketName === 'm') {
      const mediaDiff = renderer.compareMediaQueries(
        a.elementAttributes['media'] ?? '',
        b.elementAttributes['media'] ?? '',
      );
      if (mediaDiff !== 0) {
        return mediaDiff;
      }
    }

    // Within the "@container" bucket, order by container condition.
    if (a.bucketName === 'x') {
      const containerDiff = renderer.compareContainerQueries(
        a.elementAttributes['data-container'] ?? '',
        b.elementAttributes['data-container'] ?? '',
      );
      if (containerDiff !== 0) {
        return containerDiff;
      }
    }

    return Number(a.elementAttributes['data-priority']) - Number(b.elementAttributes['data-priority']);
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
