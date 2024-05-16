import { hyphenateProperty } from './utils/hyphenateProperty';
import { normalizeNestedProperty } from './utils/normalizeNestedProperty';
import type { AtRules } from './utils/types';
import { compileCSSRules } from './compileCSSRules';

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

function createCSSRule(classNameSelector: string, cssDeclaration: string, pseudos: string[]): string {
  let cssRule = cssDeclaration;

  if (pseudos.length > 0) {
    cssRule = pseudos.reduceRight((acc, selector) => {
      return `${normalizePseudoSelector(selector)} { ${acc} }`;
    }, cssDeclaration);
  }

  return `${classNameSelector}{${cssRule}}`;
}

export function compileAtomicCSSRule(
  options: CompileAtomicCSSOptions,
  atRules: AtRules,
): [string? /* ltr definition */, string? /* rtl definition */] {
  const { className, selectors, property, rtlClassName, rtlProperty, rtlValue, value } = options;
  const { container, layer, media, supports } = atRules;

  const classNameSelector = `.${className}`;
  const cssDeclaration = Array.isArray(value)
    ? `${value.map(v => `${hyphenateProperty(property)}: ${v}`).join(';')};`
    : `${hyphenateProperty(property)}: ${value};`;

  let cssRule = createCSSRule(classNameSelector, cssDeclaration, selectors);

  if (rtlProperty && rtlClassName) {
    const rtlClassNameSelector = `.${rtlClassName}`;
    const rtlCSSDeclaration = Array.isArray(rtlValue)
      ? `${rtlValue.map(v => `${hyphenateProperty(rtlProperty)}: ${v}`).join(';')};`
      : `${hyphenateProperty(rtlProperty)}: ${rtlValue};`;

    cssRule += createCSSRule(rtlClassNameSelector, rtlCSSDeclaration, selectors);
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
