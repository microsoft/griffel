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

function wrapAtRules(rule: string, atRules: Omit<AtRules, 'scope'>): string {
  const { container, layer, media, supports } = atRules;

  if (media) {
    rule = `@media ${media} { ${rule} }`;
  }
  if (layer) {
    rule = `@layer ${layer} { ${rule} }`;
  }
  if (supports) {
    rule = `@supports ${supports} { ${rule} }`;
  }
  if (container) {
    rule = `@container ${container} { ${rule} }`;
  }
  return rule;
}

export function compileAtomicCSSRule(
  options: CompileAtomicCSSOptions,
  atRules: AtRules,
): [string? /* ltr definition */, string? /* rtl definition */] {
  const { className, selectors, property, rtlClassName, rtlProperty, rtlValue, value } = options;
  const { scope } = atRules;

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

  let cssRule: string;

  if (scope) {
    // @scope needs separate blocks for LTR and RTL because the scope root
    // selector references the direction-specific atomic class. In RTL context
    // the element only has the RTL class, so @scope (.ltrClass) won't match.
    ltrRule = wrapAtRules(ltrRule, atRules);
    const resolvedLtrScope = scope.replace(/&/g, classNameSelector);
    ltrRule = ltrRule.split(classNameSelector).join(':scope');
    ltrRule = `@scope ${resolvedLtrScope} { ${ltrRule} }`;

    if (rtlRule) {
      const rtlClassNameSelector = `.${rtlClassName}`;
      rtlRule = wrapAtRules(rtlRule, atRules);
      const resolvedRtlScope = scope.replace(/&/g, rtlClassNameSelector);
      rtlRule = rtlRule.split(rtlClassNameSelector).join(':scope');
      rtlRule = `@scope ${resolvedRtlScope} { ${rtlRule} }`;
    }
    cssRule = ltrRule + rtlRule;
  } else {
    cssRule = wrapAtRules(ltrRule + rtlRule, atRules);
  }

  return compileCSSRules(cssRule, true) as [string?, string?];
}
