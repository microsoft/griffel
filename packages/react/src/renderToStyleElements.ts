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
    return (
      renderer.compareContainerQueries(
        a.elementAttributes['data-container'] ?? '',
        b.elementAttributes['data-container'] ?? '',
      ) ||
      renderer.compareMediaQueries(a.elementAttributes['media'] ?? '', b.elementAttributes['media'] ?? '') ||
      styleBucketOrdering.indexOf(a.bucketName) - styleBucketOrdering.indexOf(b.bucketName) ||
      Number(a.elementAttributes['data-priority']) - Number(b.elementAttributes['data-priority'])
    );
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
