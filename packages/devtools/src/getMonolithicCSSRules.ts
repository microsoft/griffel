import * as stylis from 'stylis';
import type { AtomicRules, MonolithicAtRules, MonolithicRules, RuleDetail } from './types';

function parseRuleElement(monolithicRules: MonolithicRules, element: stylis.Element, overriddenBy?: string) {
  const { value, children } = element;
  const selector = stylis.tokenize(value).slice(1).join('');
  monolithicRules[selector] = monolithicRules[selector] ?? [];

  (children as stylis.Element[]).forEach(child => {
    (monolithicRules[selector] as RuleDetail[]).push({
      css: child.value,
      className: stylis.tokenize(value)[0].slice(1),
      overriddenBy,
    });
  });
}

function parseAtElement(monolithicRules: MonolithicRules, element: stylis.Element, overriddenBy?: string) {
  const { value: atSelector, children } = element;
  monolithicRules[atSelector] = monolithicRules[atSelector] ?? {};

  (children as stylis.Element[]).forEach(child => {
    const childResult = {};
    parseStylisElement(childResult, child, overriddenBy);

    Object.entries<RuleDetail[]>(childResult).forEach(([selector, ruleDetails]) => {
      const atResult = monolithicRules[atSelector] as MonolithicAtRules;
      atResult[selector] = [...(atResult[selector] ?? []), ...ruleDetails];
    });
  });
}

function parseStylisElement(monolithicRules: MonolithicRules, element: stylis.Element, overriddenBy?: string) {
  const { type } = element;
  if (type.startsWith('@')) {
    parseAtElement(monolithicRules, element, overriddenBy);
  } else if (type === 'rule') {
    parseRuleElement(monolithicRules, element, overriddenBy);
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
