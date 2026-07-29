import { debugData, isDevToolsEnabled } from '../devtools/index.js';
import type { GriffelRenderer, StyleBucketName } from '../types.js';
import { createIsomorphicStyleSheetFromElement } from './createIsomorphicStyleSheet.js';
import { forEachCSSRule } from './forEachCSSRule.js';
import { getStyleSheetKeyFromElement } from './getStyleSheetForBucket.js';

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

    // Griffel emits each CSS rule into the document exactly once. In development we track
    // the rules seen while rehydrating, so we can warn if the same rule appears in more than
    // one server-rendered <style> element — a strong signal that styles were flushed into the
    // HTML multiple times (see the warning emitted after the loop).
    const seenRules = new Set<string>();
    let duplicateRuleCount = 0;

    const cacheRule = (cssRule: string, bucketName: StyleBucketName) => {
      if (process.env.NODE_ENV !== 'production') {
        if (seenRules.has(cssRule)) {
          duplicateRuleCount++;
        } else {
          seenRules.add(cssRule);
        }
      }

      renderer.insertionCache[cssRule] = bucketName;

      if (process.env.NODE_ENV !== 'production' && isDevToolsEnabled) {
        debugData.addCSSRule(cssRule);
      }
    };

    styleElements.forEach(styleElement => {
      const bucketName = styleElement.dataset['makeStylesBucket'] as StyleBucketName;
      const stylesheetKey = getStyleSheetKeyFromElement(styleElement);

      // 👇 If some elements are not created yet, we will register them in renderer
      if (!renderer.stylesheets[stylesheetKey]) {
        renderer.stylesheets[stylesheetKey] = createIsomorphicStyleSheetFromElement(styleElement);
      }

      // A bucket's text content is exactly its rules concatenated (`cssRules.join('')`), so
      // splitting it back apart structurally recovers the same strings `insertCSSRules()` uses as
      // cache keys — for every at-rule, including ones added to CSS after this code was written.
      forEachCSSRule(styleElement.textContent!, cssRule => cacheRule(cssRule, bucketName));
    });

    if (process.env.NODE_ENV !== 'production' && duplicateRuleCount > 0) {
      // eslint-disable-next-line no-console
      console.error(
        [
          '@griffel/core:',
          `Found ${duplicateRuleCount} duplicate CSS rule(s) while rehydrating server-rendered styles.`,
          'The same styles were flushed into the HTML more than once.',
          '\n\n',
          'In the Next.js App Router this happens when renderToStyleElements() is called on every',
          'useServerInsertedHTML flush without clearing the renderer in between: each flush re-emits',
          'the full stylesheet and the extra copies are streamed into <body>. Those stale copies can',
          'override styles inserted after a client-side navigation, making makeStyles() overrides lose',
          'to their makeResetStyles() base.',
          '\n\n',
          'See https://griffel.js.org/react/guides/ssr-usage for details.',
        ].join(' '),
      );
    }
  }
}
