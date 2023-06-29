import { injectDevTools, isDevToolsEnabled, debugData } from '../devtools';
import { normalizeCSSBucketEntry } from '../runtime/utils/normalizeCSSBucketEntry';
import { GriffelRenderer, StyleBucketName } from '../types';
import { getStyleSheetForBucket } from './getStyleSheetForBucket';
import { safeInsertRule } from './safeInsertRule';

let lastIndex = 0;

export interface CreateDOMRendererOptions {
  /**
   * If specified, a renderer will insert created style tags after this element.
   */
  insertionPoint?: HTMLElement;

  /**
   * A map of attributes that's passed to the generated style elements. Is useful to set "nonce" attribute.
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/nonce
   */
  styleElementAttributes?: Record<string, string>;

  /**
   * A filter run before CSS rule insertion to systematically remove CSS rules at render time.
   * This can be used to forbid specific rules from being written to the style sheet at run time without
   * affecting build time styles.
   *
   * ⚠️ Keep the filter as performant as possible to avoid negative performance impacts to your application.
   * ⚠️ This API is unstable and can be removed from the library at any time.
   */
  unstable_filterCSSRule?: (cssRule: string) => boolean;

  /**
   * @param a - media query
   * @param b - media query
   * @returns positive number if a > b or negative number if a < b
   */
  compareMediaQueries?: (a: string, b: string) => number;
}

/** @internal */
export const defaultCompareMediaQueries = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

/**
 * Creates a new instances of a renderer.
 *
 * @public
 */
export function createDOMRenderer(
  targetDocument: Document | undefined = typeof document === 'undefined' ? undefined : document,
  options: CreateDOMRendererOptions = {},
): GriffelRenderer {
  const {
    unstable_filterCSSRule,
    insertionPoint,
    styleElementAttributes,
    compareMediaQueries = defaultCompareMediaQueries,
  } = options;
  const renderer: GriffelRenderer = {
    insertionCache: {},
    stylesheets: {},
    styleElementAttributes: Object.freeze(styleElementAttributes),
    compareMediaQueries,

    id: `d${lastIndex++}`,

    insertCSSRules(cssRules) {
      // eslint-disable-next-line guard-for-in
      for (const styleBucketName in cssRules) {
        const cssRulesForBucket = cssRules[styleBucketName as StyleBucketName]!;

        // This is a hot path in rendering styles: ".length" is cached in "l" var to avoid accesses the property
        for (let i = 0, l = cssRulesForBucket.length; i < l; i++) {
          const [ruleCSS, metadata] = normalizeCSSBucketEntry(cssRulesForBucket[i]);
          const sheet = getStyleSheetForBucket(
            styleBucketName as StyleBucketName,
            targetDocument,
            insertionPoint || null,
            renderer,
            metadata,
          );

          if (renderer.insertionCache[ruleCSS]) {
            continue;
          }

          renderer.insertionCache[ruleCSS] = styleBucketName as StyleBucketName;

          if (process.env.NODE_ENV !== 'production' && isDevToolsEnabled) {
            debugData.addCSSRule(ruleCSS);
          }

          if (unstable_filterCSSRule) {
            if (unstable_filterCSSRule(ruleCSS)) {
              safeInsertRule(sheet, ruleCSS);
            }
          } else {
            safeInsertRule(sheet, ruleCSS);
          }
        }
      }
    },
  };

  if (targetDocument && process.env.NODE_ENV !== 'production' && isDevToolsEnabled) {
    injectDevTools(targetDocument);
  }

  return renderer;
}
