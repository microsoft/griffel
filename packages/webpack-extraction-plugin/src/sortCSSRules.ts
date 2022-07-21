import { getStyleBucketName, GriffelRenderer, StyleBucketName, styleBucketOrdering } from '@griffel/core';
import { COMMENT, compile, Element, KEYFRAMES, MEDIA, RULESET, serialize, stringify, SUPPORTS, tokenize } from 'stylis';

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

  if (Array.isArray(element.children)) {
    return element.value + '[' + element.children.map(child => getElementReference(child, suffix)).join(',') + ']';
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
  const childElements = compile(css)
    // Remove top level comments as it is unclear how to sort them
    .filter(element => element.type !== COMMENT)
    .map(element => ({
      ...element,
      bucketName: getStyleBucketNameFromElement(element),
      metadata: getElementMetadata(element),
      reference: getElementReference(element),
    }));
  const uniqueElements = childElements.reduce<Record<string, typeof childElements[0]>>((acc, element) => {
    acc[element.reference] = element;

    return acc;
  }, {});
  const sortedElements = Object.values(uniqueElements).sort((elementA, elementB) => {
    if (elementA.bucketName === 'm' && elementB.bucketName === 'm') {
      return compareMediaQueries(elementA.metadata, elementB.metadata);
    }

    if (elementA.bucketName === elementB.bucketName) {
      return 0;
    }

    return styleBucketOrdering.indexOf(elementA.bucketName) - styleBucketOrdering.indexOf(elementB.bucketName);
  });

  return serialize(sortedElements, stringify);
}
