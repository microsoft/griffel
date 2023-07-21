import { compile } from 'stylis';
import { isAtRuleElement } from './isAtRuleElement';

describe('isAtRuleElement', () => {
  it.each([
    ['@container { div { color: red } }', true],
    ['@layer foo { div { color: red } }', true],
    ['@media (min-width: 100px) { div { color: red } }', true],
    ['@supports (display: flex) { div { color: red } }', true],
    ['div { color: red }', false],
    ['div:hover { color: red }', false],
  ])('handles "%s"', (css, expected) => {
    expect(isAtRuleElement(compile(css)[0])).toBe(expected);
  });
});
