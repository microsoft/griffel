import { compile, middleware, prefixer, rulesheet, serialize, stringify } from 'stylis';

import { hyphenateProperty } from './utils/hyphenateProperty';
import { normalizeNestedProperty } from './utils/normalizeNestedProperty';

export interface CompileCSSOptions {
  className: string;

  selectors: string[];
  media: string;
  layer: string;
  support: string;

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

export function compileCSSRules(cssRules: string): string[] {
  const rules: string[] = [];

  serialize(
    compile(cssRules),
    middleware([
      prefixer,
      stringify,

      // 💡 we are using `.insertRule()` API for DOM operations, which does not support
      // insertion of multiple CSS rules in a single call. `rulesheet` plugin extracts
      // individual rules to be used with this API
      rulesheet(rule => rules.push(rule)),
    ]),
  );

  return rules;
}

function createCSSRule(classNameSelector: string, cssDeclaration: string, pseudos: string[]): string {
  let globalSelector = '';
  let cssRule = cssDeclaration;

  if (pseudos.length > 0) {
    cssRule = pseudos.reduceRight((acc, selector, index) => {
      // Should be handled by namespace plugin of Stylis, is buggy now
      // Issues are reported:
      // https://github.com/thysultan/stylis.js/issues/253
      // https://github.com/thysultan/stylis.js/issues/252
      if (selector.indexOf(':global(') === 0) {
        // 👇 :global(GROUP_1)GROUP_2
        const GLOBAL_PSEUDO_REGEX = /global\((.+)\)(.+)?/;
        const result = GLOBAL_PSEUDO_REGEX.exec(selector)!;

        globalSelector = result[1] + ' ';
        const restPseudo = result[2] || '';

        // should be normalized to handle ":global(SELECTOR) &"
        const normalizedPseudoSelector = normalizePseudoSelector(restPseudo);

        if (normalizedPseudoSelector === '') {
          return acc;
        }

        return `${normalizedPseudoSelector} { ${acc} }`;
      }

      return `${normalizePseudoSelector(selector)} { ${acc} }`;
    }, cssDeclaration);
  }

  return `${globalSelector}${classNameSelector}{${cssRule}}`;
}

export function compileCSS(options: CompileCSSOptions): [string /* ltr definition */, string? /* rtl definition */] {
  const { className, media, layer, selectors, support, property, rtlClassName, rtlProperty, rtlValue, value } = options;

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

  if (support) {
    cssRule = `@supports ${support} { ${cssRule} }`;
  }

  return compileCSSRules(cssRule) as [string, string?];
}
