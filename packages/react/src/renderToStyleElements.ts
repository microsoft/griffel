import { styleBucketOrdering } from '@griffel/core';
import * as React from 'react';
import type { GriffelRenderer, StyleBucketName } from '@griffel/core';

/**
 * This method returns a list of <style> React elements with the rendered CSS. This is useful for Server-Side rendering.
 *
 * @public
 */
export function renderToStyleElements(renderer: GriffelRenderer): React.ReactElement[] {
  const styleElements = Object.values(renderer.styleElements).sort((a, b) => {
    return (
      styleBucketOrdering.indexOf(a.__attributes!['data-make-styles-bucket'] as StyleBucketName) -
      styleBucketOrdering.indexOf(b.__attributes!['data-make-styles-bucket'] as StyleBucketName)
    );
  });

  return styleElements
    .map((styleElement, i) => {
      // don't want to create any empty style elements
      if (!styleElement.sheet.__cssRules?.length) {
        return null;
      }

      return React.createElement('style', {
        key: styleElement.__attributes!['data-make-styles-bucket'],

        // TODO: support "nonce"
        // ...renderer.styleNodeAttributes,
        ...styleElement.__attributes,
        'data-make-styles-rehydration': 'true',

        dangerouslySetInnerHTML: {
          __html: styleElement.sheet.__cssRules.join(''),
        },
      });
    })
    .filter(Boolean) as React.ReactElement[];
}
