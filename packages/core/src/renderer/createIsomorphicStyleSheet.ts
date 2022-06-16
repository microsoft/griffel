import { DATA_BUCKET_ATTR } from '../constants';
import { IsomorphicStyleSheet } from '../types';

export function createIsomorphicStyleSheet(
  target: Document | undefined,
  bucketName: string,
  elementAttributes: Record<string, string>,
): IsomorphicStyleSheet {
  let element: HTMLStyleElement | undefined;
  const __cssRulesForSSR: string[] = [];

  elementAttributes[DATA_BUCKET_ATTR] = bucketName;
  if (target) {
    element = target.createElement('style');
    for (const attrName in elementAttributes) {
      element.setAttribute(attrName, elementAttributes[attrName]);
    }
  }

  function insertRule(rule: string) {
    if (element?.sheet) {
      return element.sheet.insertRule(rule, element.sheet.cssRules.length);
    }

    return __cssRulesForSSR.push(rule);
  }

  return {
    elementAttributes,
    insertRule,
    element,
    bucketName,
    cssRules() {
      if (element?.sheet) {
        return Array.from(element.sheet.cssRules).map(cssRule => cssRule.cssText);
      }

      return __cssRulesForSSR;
    },
  };
}

export function createIsomorphicStyleSheetFromElement(target: Document, element: HTMLStyleElement) {
  const elementAttributes = Array.from(element.attributes).reduce((acc, attr) => {
    acc[attr.name] = attr.value;
    return acc;
  }, {} as Record<string, string>);
  return createIsomorphicStyleSheet(target, elementAttributes[DATA_BUCKET_ATTR], elementAttributes);
}
