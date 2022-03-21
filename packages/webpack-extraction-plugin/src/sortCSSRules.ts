import { getStyleBucketName, GriffelRenderer, StyleBucketName, styleBucketOrdering } from '@griffel/core';
import { compile, Element, KEYFRAMES, MEDIA, RULESET, serialize, stringify, SUPPORTS, tokenize } from 'stylis';

export function getSelectorFromElement(element: Element) {
  return tokenize(element.value).slice(1).join('');
}

export function getElementMetadata(element: Element): string {
  if (element.type === MEDIA) {
    return element.value.replace(/^@media/, '').trim();
  }

  return '';
}

export function getElementReference(element: Element, suffix = ''): string {
  if (element.type === RULESET || element.type === KEYFRAMES) {
    return element.value + suffix;
  }

  if (Array.isArray(element.children) && element.children.length === 1) {
    return getElementReference(element.children[0], element.value + suffix);
  }

  function removeRootProperty(element: Element): unknown {
    return {
      ...element,
      children: Array.isArray(element.children)
        ? element.children.map(child => removeRootProperty(child))
        : element.children,
      root: undefined,
      parent: undefined,
    };
  }

  throw new Error(
    [
      'getElementReference(): An unhandled case, please report if it happens and provide debug information about an element:',
      JSON.stringify(removeRootProperty(element), null, 2),
    ].join('\n'),
  );
}

export function getStyleBucketNameFromElement(element: Element): StyleBucketName {
  if (element.type === KEYFRAMES) {
    return 'k';
  }

  return getStyleBucketName(
    getSelectorFromElement(element),
    element.type === '@layer' ? element.value : '',
    element.type === MEDIA ? element.value : '',
    element.type === SUPPORTS ? element.value : '',
  );
}

export function sortCSSRules(css: string, compareMediaQueries: GriffelRenderer['compareMediaQueries']): string {
  return serialize(
    compile(css)
      .map(element => ({
        ...element,
        bucketName: getStyleBucketNameFromElement(element),
        metadata: getElementMetadata(element),
        reference: getElementReference(element),
      }))
      .filter(
        (elementA, index, self) => self.findIndex(elementB => elementA.reference === elementB.reference) === index,
      )
      .sort((nodeA, nodeB) => {
        if (nodeA.bucketName === 'm' && nodeB.bucketName === 'm') {
          return compareMediaQueries(nodeA.metadata, nodeB.metadata);
        }

        if (nodeA.bucketName === nodeB.bucketName) {
          return 0;
        }

        return styleBucketOrdering.indexOf(nodeA.bucketName) - styleBucketOrdering.indexOf(nodeB.bucketName);
      }),
    stringify,
  );
}
