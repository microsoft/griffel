import { DATA_BUCKET_ATTR, DATA_PRIORITY_ATTR } from '../constants.js';
import type { IsomorphicStyleSheet, StyleBucketName } from '../types.js';
import { insertRuleInCascadeLayer, serializeRulesInCascadeLayer } from './cascadeLayers.js';

export function createIsomorphicStyleSheet(
  styleElement: HTMLStyleElement | undefined,
  bucketName: StyleBucketName,
  priority: number,
  elementAttributes: Record<string, string>,
  layer?: string,
): IsomorphicStyleSheet {
  // no CSSStyleSheet in SSR, just append rules here for server render
  const __cssRulesForSSR: string[] = [];

  elementAttributes[DATA_BUCKET_ATTR] = bucketName;
  elementAttributes[DATA_PRIORITY_ATTR] = String(priority);

  if (styleElement) {
    // eslint-disable-next-line guard-for-in
    for (const attrName in elementAttributes) {
      styleElement.setAttribute(attrName, elementAttributes[attrName]);
    }
  }

  function insertRule(rule: string) {
    if (styleElement?.sheet) {
      if (layer) {
        return insertRuleInCascadeLayer(styleElement.sheet, layer, rule);
      }

      return styleElement.sheet.insertRule(rule, styleElement.sheet.cssRules.length);
    }

    return __cssRulesForSSR.push(rule);
  }

  return {
    elementAttributes,
    insertRule,
    element: styleElement,
    bucketName,
    layer,
    cssRules() {
      if (styleElement?.sheet) {
        return Array.from(styleElement.sheet.cssRules).map(cssRule => cssRule.cssText);
      }

      // 👇 in SSR rules are wrapped only on serialization, so the stored rules match insertion cache keys
      if (layer) {
        return serializeRulesInCascadeLayer(layer, __cssRulesForSSR);
      }

      return __cssRulesForSSR;
    },
  };
}

export function createIsomorphicStyleSheetFromElement(element: HTMLStyleElement, layer?: string) {
  const elementAttributes = Array.from(element.attributes).reduce((acc, attr) => {
    acc[attr.name] = attr.value;
    return acc;
  }, {} as Record<string, string>);
  const stylesheet = createIsomorphicStyleSheet(
    element,
    elementAttributes[DATA_BUCKET_ATTR] as StyleBucketName,
    Number(elementAttributes[DATA_PRIORITY_ATTR]),
    elementAttributes,
    layer,
  );
  return stylesheet;
}
