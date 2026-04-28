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
  const { container, layer, media, scope, supports } = atRules;

  const classNameSelector = `.${className}`;
  const cssDeclaration = Array.isArray(value)
    ? `${value.map(v => `${hyphenateProperty(property)}: ${v}`).join(';')};`
    : `${hyphenateProperty(property)}: ${value};`;

  let ltrRule = createCSSRule(classNameSelector, cssDeclaration, selectors);
  let rtlRule = '';

  if (rtlProperty && rtlClassName) {
    const rtlClassNameSelector = `.${rtlClassName}`;
    const rtlCSSDeclaration = Array.isArray(rtlValue)
      ? `${rtlValue.map(v => `${hyphenateProperty(rtlProperty)}: ${v}`).join(';')};`
      : `${hyphenateProperty(rtlProperty)}: ${rtlValue};`;

    rtlRule = createCSSRule(rtlClassNameSelector, rtlCSSDeclaration, selectors);
  }

  if (scope) {
    // @scope is applied as the innermost at-rule wrapper, so that outer
    // at-rules (@media, @supports, etc.) wrap around it naturally.
    // Separate @scope blocks for LTR and RTL because the scope root
    // selector references the direction-specific atomic class.
    ltrRule = ltrRule.split(classNameSelector).join(':scope');
    ltrRule = `@scope (${classNameSelector}) ${scope} { ${ltrRule} }`;

    if (rtlRule) {
      const rtlClassNameSelector = `.${rtlClassName}`;
      rtlRule = rtlRule.split(rtlClassNameSelector).join(':scope');
      rtlRule = `@scope (${rtlClassNameSelector}) ${scope} { ${rtlRule} }`;
    }
  }

  let cssRule = ltrRule + rtlRule;

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
