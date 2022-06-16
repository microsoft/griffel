import { injectDevTools, isDevToolsEnabled, debugData } from '../devtools';
import { GriffelRenderer, StyleBucketName } from '../types';
import { getStyleSheetForBucket } from './getStyleSheetForBucket';

let lastIndex = 0;

export interface CreateDOMRendererOptions {
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
}

/**
 * Creates a new instances of a renderer.
 *
 * @public
 */
export function createDOMRenderer(
  target: Document | undefined = typeof document === 'undefined' ? undefined : document,
  options: CreateDOMRendererOptions = {},
): GriffelRenderer {
  const { unstable_filterCSSRule } = options;
  const renderer: GriffelRenderer = {
    insertionCache: {},
    stylesheets: {},

    id: `d${lastIndex++}`,

    insertCSSRules(cssRules) {
      // eslint-disable-next-line guard-for-in
      for (const styleBucketName in cssRules) {
        const cssRulesForBucket = cssRules[styleBucketName as StyleBucketName]!;
        const sheet = getStyleSheetForBucket(
          styleBucketName as StyleBucketName,
          target,
          renderer,
          options.styleElementAttributes,
        );

        // This is a hot path in rendering styles: ".length" is cached in "l" var to avoid accesses the property
        for (let i = 0, l = cssRulesForBucket.length; i < l; i++) {
          const ruleCSS = cssRulesForBucket[i];

          if (renderer.insertionCache[ruleCSS]) {
            continue;
          }

          renderer.insertionCache[ruleCSS] = styleBucketName as StyleBucketName;
          if (process.env.NODE_ENV !== 'production' && isDevToolsEnabled) {
            debugData.addCSSRule(ruleCSS);
          }

          try {
            if (unstable_filterCSSRule) {
              if (unstable_filterCSSRule(ruleCSS)) {
                sheet.insertRule(ruleCSS);
              }
            } else {
              sheet.insertRule(ruleCSS);
            }
          } catch (e) {
            // We've disabled these warnings due to false-positive errors with browser prefixes
            if (process.env.NODE_ENV !== 'production' && !ignoreSuffixesRegex.test(ruleCSS)) {
              // eslint-disable-next-line no-console
              console.error(`There was a problem inserting the following rule: "${ruleCSS}"`, e);
            }
          }
        }
      }
    },
  };

  if (target && process.env.NODE_ENV !== 'production' && isDevToolsEnabled) {
    injectDevTools(target);
  }

  return renderer;
}

/**
 * Suffixes to be ignored in case of error
 */
const ignoreSuffixes = [
  '-moz-placeholder',
  '-moz-focus-inner',
  '-moz-focusring',
  '-ms-input-placeholder',
  '-moz-read-write',
  '-moz-read-only',
].join('|');
const ignoreSuffixesRegex = new RegExp(`:(${ignoreSuffixes})`);
