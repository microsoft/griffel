import * as stylis from 'stylis';
import type { AtomicRules, MonolithicAtRules, MonolithicRules, RuleDetail } from './types';

function parseRuleElement(monolithicRules: MonolithicRules, element: stylis.Element, overriddenBy?: string) {
  // example of `value`: `.f3xbvq9:hover`
  // `children` contains all css under the `value` selector
  const { value: classNameSelector, children } = element;

  const nestedSelector = stylis.tokenize(classNameSelector).slice(1).join('');
  monolithicRules[nestedSelector] = monolithicRules[nestedSelector] ?? [];

  if (Array.isArray(children)) {
    children.forEach(child => {
      (monolithicRules[nestedSelector] as RuleDetail[]).push({
        css: child.value,
        className: stylis.tokenize(classNameSelector)[0].slice(1),
        overriddenBy,
      });
    });
  } else {
    throw new Error('Unsupported input from "element.children"');
  }
}

function parseAtElement(monolithicRules: MonolithicRules, element: stylis.Element, overriddenBy?: string) {
  const { value: atSelector, children } = element;

  monolithicRules[atSelector] = monolithicRules[atSelector] ?? {};

  (children as stylis.Element[]).forEach(child => {
    const childResult: MonolithicAtRules = {};
    parseStylisElement(childResult, child, overriddenBy);

    const atResult = monolithicRules[atSelector] as MonolithicAtRules;
    Object.keys(childResult).forEach(selector => {
      atResult[selector] = [...(atResult[selector] ?? []), ...childResult[selector]];
    });
  });
}

function parseStylisElement(monolithicRules: MonolithicRules, element: stylis.Element, overriddenBy?: string) {
  const { type } = element;
  if (type.startsWith('@')) {
    parseAtElement(monolithicRules, element, overriddenBy);
  } else if (type === 'rule') {
    parseRuleElement(monolithicRules, element, overriddenBy);
  } else {
    throw new Error('Unsupported type of entries');
  }
}

export function getMonolithicCSSRules(rules: AtomicRules[]): MonolithicRules {
  const monolithicRules = {};
  rules.forEach(entry => {
    const compiled = stylis.compile(entry.cssRule);
    compiled.forEach(element => {
      parseStylisElement(monolithicRules, element, entry.overriddenBy);
    });
  });
  return monolithicRules;
}
