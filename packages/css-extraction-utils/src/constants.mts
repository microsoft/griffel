/**
 * A marker that prefixes every block of CSS produced by `generateCSSRules()`. It is used to find Griffel rules in CSS
 * assets & to restore the style buckets they belong to.
 */
export const CSS_START_MARKER = '/** @griffel:css-start';
