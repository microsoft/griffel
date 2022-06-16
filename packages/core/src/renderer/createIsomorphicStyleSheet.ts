import { DATA_BUCKET_ATTR } from '../constants';
import { IsomorphicStyleSheet } from '../types';

export function createIsomorphicStyleSheet(
  styleElement: HTMLStyleElement | undefined,
  bucketName: string,
  elementAttributes: Record<string, string>,
): IsomorphicStyleSheet {
  // no CSSStyleSheet in SSR, just append rules here for server render
  const __cssRulesForSSR: string[] = [];

  elementAttributes[DATA_BUCKET_ATTR] = bucketName;
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
  const stylesheet = createIsomorphicStyleSheet(element, elementAttributes[DATA_BUCKET_ATTR], elementAttributes);
  return stylesheet;
}
