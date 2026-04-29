import { compileCSSRules } from './compileCSSRules.js';
import { hyphenateProperty } from './utils/hyphenateProperty.js';
import { normalizeNestedProperty } from './utils/normalizeNestedProperty.js';
import type { AtRules } from './utils/types.js';

export interface CompileAtomicCSSOptions {
  className: string;
  selectors: string[];

  property: string;
  value: number | string | Array<number | string>;

  rtlClassName?: string;
  rtlProperty?: string;
  rtlValue?: number | string | Array<number | string>;
}

const PSEUDO_SELECTOR_REGEX = /,( *[^ &])/g;

/**
 * Normalizes pseudo selectors to always contain &, requires to work properly with comma-separated selectors.
 *
 * @example
 *   ":hover" => "&:hover"
 *   " :hover" => "& :hover"
 *   ":hover,:focus" => "&:hover,&:focus"
 *   " :hover, :focus" => "& :hover,& :focus"
 */
export function normalizePseudoSelector(pseudoSelector: string): string {
  return (
    '&' +
    normalizeNestedProperty(
      // Regex there replaces a comma, spaces and an ampersand if it's present with comma and an ampersand.
      // This allows to normalize input, see examples in JSDoc.
      pseudoSelector.replace(PSEUDO_SELECTOR_REGEX, ',&$1'),
    )
  );
}

function createCSSDeclaration(cssDeclaration: string, pseudos: string[]): string {
  return pseudos.reduceRight((acc, selector) => `${normalizePseudoSelector(selector)} { ${acc} }`, cssDeclaration);
}

export function compileAtomicCSSRule(
  options: CompileAtomicCSSOptions,
  atRules: AtRules,
): [string? /* ltr definition */, string? /* rtl definition */] {
  const { className, selectors, property, rtlClassName, rtlProperty, rtlValue, value } = options;
  const { container, layer, media, scope, supports } = atRules;

  const classNameSelector = `.${className}`;
  const cssDeclaration = Array.isArray(value)
    ? `${value.map(v => `${hyphenateProperty(property)}: ${v}`).join(';')};`
    : `${hyphenateProperty(property)}: ${value};`;

  // Under @scope, the rule body is anchored on :scope (the spec-defined
  // alias for the scope root set via the (.className) prelude). @scope
  // wraps innermost so outer at-rules (@media, @supports, etc.) compose
  // around it. Separate blocks for LTR and RTL because the prelude
  // references the direction-specific atomic class.
  const ltrBody = createCSSDeclaration(cssDeclaration, selectors);
  let cssRule = scope
    ? `@scope (${classNameSelector}) ${scope} { :scope{${ltrBody}} }`
    : `${classNameSelector}{${ltrBody}}`;

  if (rtlProperty && rtlClassName) {
    const rtlClassNameSelector = `.${rtlClassName}`;
    const rtlCSSDeclaration = Array.isArray(rtlValue)
      ? `${rtlValue.map(v => `${hyphenateProperty(rtlProperty)}: ${v}`).join(';')};`
      : `${hyphenateProperty(rtlProperty)}: ${rtlValue};`;

    const rtlBody = createCSSDeclaration(rtlCSSDeclaration, selectors);
    cssRule += scope
      ? `@scope (${rtlClassNameSelector}) ${scope} { :scope{${rtlBody}} }`
      : `${rtlClassNameSelector}{${rtlBody}}`;
  }

  if (media) {
    cssRule = `@media ${media} { ${cssRule} }`;
  }
  if (layer) {
    cssRule = `@layer ${layer} { ${cssRule} }`;
  }
  if (supports) {
    cssRule = `@supports ${supports} { ${cssRule} }`;
  }
  if (container) {
    cssRule = `@container ${container} { ${cssRule} }`;
  }

  return compileCSSRules(cssRule, true) as [string?, string?];
}
