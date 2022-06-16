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
      styleBucketOrdering.indexOf(a.dataset['makeStylesBucket'] as StyleBucketName) -
      styleBucketOrdering.indexOf(b.dataset['makeStylesBucket'] as StyleBucketName)
    );
  });

  return styleElements
    .map((styleElement, i) => {
      // don't want to create any empty style elements
      if (!styleElement.sheet.__cssRules?.length) {
        return null;
      }

      const dataset: Record<string, string | undefined> = {};
      for (const i in styleElement.dataset) {
        const attr = styleElement.dataset[i];
        dataset[`data-${kebabize(i)}`] = attr;
      }

      return React.createElement('style', {
        // key: bucketName,
        key: styleElement.dataset['makeStylesBucket'],

        // TODO: support "nonce"
        // ...renderer.styleNodeAttributes,
        ...styleElement.__attributes,
        ...dataset,
        'data-make-styles-rehydration': 'true',

        dangerouslySetInnerHTML: {
          __html: styleElement.sheet.__cssRules.join(''),
        },
      });
    })
    .filter(Boolean) as React.ReactElement[];
}

const kebabize = (str: string) => str.replace(/[A-Z]+(?![a-z])|[A-Z]/g, ($, ofs) => (ofs ? '-' : '') + $.toLowerCase());
