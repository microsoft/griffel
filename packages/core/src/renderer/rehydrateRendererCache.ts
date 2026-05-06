import { debugData, isDevToolsEnabled } from '../devtools/index.js';
import type { GriffelRenderer, StyleBucketName } from '../types.js';
import { createIsomorphicStyleSheetFromElement } from './createIsomorphicStyleSheet.js';
import { getStyleSheetKeyFromElement } from './getStyleSheetForBucket.js';

// Regexps to extract names of classes and animations
// https://github.com/styletron/styletron/blob/e0fcae826744eb00ce679ac613a1b10d44256660/packages/styletron-engine-atomic/src/client/client.js#L8
const KEYFRAMES_HYDRATOR = /@(-webkit-)?keyframes ([^{]+){((?:(?:from|to|(?:\d+\.?\d*%))\{(?:[^}])*})*)}/g;
const AT_RULES_HYDRATOR = /@(media|supports|layer|scope)[^{]+\{([\s\S]+?})\s*}/g;
const SCOPE_HYDRATOR = /@scope[^{]+\{([\s\S]+?})\s*}/g;
const STYLES_HYDRATOR = /\.([^{:]+)(:[^{]+)?{(?:[^}]*;)?([^}]*?)}/g;

const regexps: Partial<Record<StyleBucketName, RegExp>> = {
  k: KEYFRAMES_HYDRATOR,
  t: AT_RULES_HYDRATOR,
  m: AT_RULES_HYDRATOR,
};

/**
 * Should be called in a case of Server-Side rendering. Rehydrates cache from for a renderer to avoid double insertion
 * of classes to DOM.
 *
 * @public
 */
export function rehydrateRendererCache(
  renderer: GriffelRenderer,
  target: Document | undefined = typeof document === 'undefined' ? undefined : document,
) {
  if (target) {
    const styleElements = target.querySelectorAll<HTMLStyleElement>('[data-make-styles-bucket]');

    styleElements.forEach(styleElement => {
      const bucketName = styleElement.dataset['makeStylesBucket'] as StyleBucketName;
      const stylesheetKey = getStyleSheetKeyFromElement(styleElement);

      // 👇 If some elements are not created yet, we will register them in renderer
      if (!renderer.stylesheets[stylesheetKey]) {
        renderer.stylesheets[stylesheetKey] = createIsomorphicStyleSheetFromElement(styleElement);
      }

      const regex = regexps[bucketName];
      let match;
      let textContent = styleElement.textContent!;

      if (regex) {
        // eslint-disable-next-line no-cond-assign
        while ((match = regex.exec(textContent))) {
          const [cssRule] = match;

          renderer.insertionCache[cssRule] = bucketName;

          if (process.env.NODE_ENV !== 'production' && isDevToolsEnabled) {
            debugData.addCSSRule(cssRule);
          }
        }
      } else {
        // @scope rules can appear in any bucket, so extract them first to prevent
        // STYLES_HYDRATOR from spuriously matching class selectors inside @scope blocks.
        // eslint-disable-next-line no-cond-assign
        while ((match = SCOPE_HYDRATOR.exec(textContent))) {
          const [cssRule] = match;

          renderer.insertionCache[cssRule] = bucketName;
          textContent = textContent.replace(cssRule, '');

          if (process.env.NODE_ENV !== 'production' && isDevToolsEnabled) {
            debugData.addCSSRule(cssRule);
          }
        }

        // eslint-disable-next-line no-cond-assign
        while ((match = STYLES_HYDRATOR.exec(textContent))) {
          const [cssRule] = match;

          renderer.insertionCache[cssRule] = bucketName;

          if (process.env.NODE_ENV !== 'production' && isDevToolsEnabled) {
            debugData.addCSSRule(cssRule);
          }
        }
      }
    });
  }
}
