import * as stylis from 'stylis';
import type { AtomicRules, MonolithicAtRules, MonolithicRules, RuleDetail } from './types';

// match className like '.fvnxzrg' or '.fvnxzrg.fui-focus-visible'
const griffelClassNameRegex = /^\.(f[0-9a-z]+)(\..*|$)/;

function parseRuleElement(element: stylis.Element, overriddenBy?: string) {
  // example of `value`: `.f3xbvq9:hover`
  // `children` contains all CSS rules under the `value` selector
  const { value: classNameSelector, children } = element;

  if (Array.isArray(children)) {
    let className: string | undefined;
    const selector = stylis
      .tokenize(classNameSelector)
      .map(token => {
        const match = token.match(griffelClassNameRegex);
        if (match?.[1]) {
          className = match?.[1];
          return match[2] ?? '';
        }
        return token;
      })
      .join('');
    const rules: RuleDetail[] = children.map(child => ({
      css: child.value,
      className: className ?? stylis.tokenize(classNameSelector)[0].slice(1),
      overriddenBy,
    }));
    return {
      selector,
      rules,
    };
  }
  throw new Error('Unsupported input from "element.children"');
}

function parseAtElement(element: stylis.Element, overriddenBy?: string) {
  const { value: atSelector, children } = element;

  if (Array.isArray(children)) {
    const rules: MonolithicAtRules = {};
    children.forEach(child => {
      const { selector: childSelector, rules: childRules } = parseRuleElement(child, overriddenBy);
      rules[childSelector] = [...(rules[childSelector] || []), ...childRules];
    });

    return {
      selector: atSelector,
      rules,
    };
  }
  throw new Error('Unsupported input from "element.children"');
}

function parseElement(element: stylis.Element, overriddenBy?: string) {
  const { type } = element;

  if (type.startsWith('@')) {
    return parseAtElement(element, overriddenBy);
  }

  if (type === 'rule') {
    return parseRuleElement(element, overriddenBy);
  }

  throw new Error('Unsupported type of entries');
}

export function getMonolithicCSSRules(rules: AtomicRules[]): MonolithicRules {
  return rules.reduce((acc, entry) => {
    const compiled = stylis.compile(entry.cssRule);

    compiled.forEach(element => {
      const { selector, rules } = parseElement(element, entry.overriddenBy);

      if (Array.isArray(rules)) {
        acc[selector] = [...((acc[selector] as RuleDetail[]) || []), ...rules];
      } else {
        acc[selector] = acc[selector] ?? {};
        const childRules = acc[selector] as MonolithicAtRules;
        Object.entries(rules).forEach(([nestedSelector, nestedRules]) => {
          childRules[nestedSelector] = [...(childRules[nestedSelector] || []), ...nestedRules];
        });
      }
    });

    return acc;
  }, {} as MonolithicRules);
}
