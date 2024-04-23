import { DATA_BUCKET_ATTR, DATA_PRIORITY_ATTR } from '../constants';
import type { IsomorphicStyleSheet, StyleBucketName } from '../types';

export function createIsomorphicStyleSheet(
  styleElement: HTMLStyleElement | undefined,
  bucketName: StyleBucketName,
  priority: number,
  elementAttributes: Record<string, string>,
): IsomorphicStyleSheet {
  // no CSSStyleSheet in SSR, just append rules here for server render
  const __cssRulesForSSR: string[] = [];

  elementAttributes[DATA_BUCKET_ATTR] = bucketName;
  elementAttributes[DATA_PRIORITY_ATTR] = String(priority);

  if (styleElement) {
    for (const attrName in elementAttributes) {
      styleElement.setAttribute(attrName, elementAttributes[attrName]);
    }
  }

  function insertRule(rule: string) {
    if (styleElement?.sheet) {
      return styleElement.sheet.insertRule(rule, styleElement.sheet.cssRules.length);
    }

    return __cssRulesForSSR.push(rule);
  }

  return {
    elementAttributes,
    insertRule,
    element: styleElement,
    bucketName,
    cssRules() {
      if (styleElement?.sheet) {
        return Array.from(styleElement.sheet.cssRules).map(cssRule => cssRule.cssText);
      }

      return __cssRulesForSSR;
    },
  };
}

export function createIsomorphicStyleSheetFromElement(element: HTMLStyleElement) {
  const elementAttributes = Array.from(element.attributes).reduce((acc, attr) => {
    acc[attr.name] = attr.value;
    return acc;
  }, {} as Record<string, string>);
  const stylesheet = createIsomorphicStyleSheet(
    element,
    elementAttributes[DATA_BUCKET_ATTR] as StyleBucketName,
    Number(elementAttributes[DATA_PRIORITY_ATTR]),
    elementAttributes,
  );
  return stylesheet;
}
