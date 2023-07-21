import type { Middleware } from 'stylis';
import { isAtRuleElement } from './isAtRuleElement';

export const sortClassesInAtRulesPlugin: Middleware = element => {
  if (isAtRuleElement(element) && Array.isArray(element.children)) {
    element.children.sort((a, b) => (a.props[0] > b.props[0] ? 1 : -1));
  }
};
