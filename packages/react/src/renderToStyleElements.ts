import { styleBucketOrdering } from '@griffel/core';
import * as React from 'react';
import type { GriffelRenderer } from '@griffel/core';

/**
 * This method returns a list of <style> React elements with the rendered CSS. This is useful for Server-Side rendering.
 *
 * @public
 */
export function renderToStyleElements(renderer: GriffelRenderer): React.ReactElement[] {
  const styleElements = Object.values(renderer.styleElements).sort((a, b) => {
    return styleBucketOrdering.indexOf(a.bucketName) - styleBucketOrdering.indexOf(b.bucketName);
  });

  return styleElements
    .map((styleElement, i) => {
      const cssRules = styleElement.cssRules();
      // don't want to create any empty style elements
      if (!cssRules.length) {
        return null;
      }

      return React.createElement('style', {
        key: styleElement.bucketName,

        // TODO: support "nonce"
        // ...renderer.styleNodeAttributes,
        ...styleElement.elementAttributes,
        'data-make-styles-rehydration': 'true',

        dangerouslySetInnerHTML: {
          __html: cssRules.join(''),
        },
      });
    })
    .filter(Boolean) as React.ReactElement[];
}
