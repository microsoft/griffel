import { debugData, isDevToolsEnabled } from '../devtools/index.js';
import type { GriffelRenderer, StyleBucketName } from '../types.js';
import { createIsomorphicStyleSheetFromElement } from './createIsomorphicStyleSheet.js';
import { getStyleSheetKeyFromElement } from './getStyleSheetForBucket.js';

// Regexps to extract names of classes and animations
// https://github.com/styletron/styletron/blob/e0fcae826744eb00ce679ac613a1b10d44256660/packages/styletron-engine-atomic/src/client/client.js#L8
const KEYFRAMES_HYDRATOR = /@(-webkit-)?keyframes ([^{]+){((?:(?:from|to|(?:\d+\.?\d*%))\{(?:[^}])*})*)}/g;
const AT_RULES_HYDRATOR = /@(media|supports|layer|scope|container)[^{]+\{([\s\S]+?})\s*}/g;
const SCOPE_HYDRATOR = /@scope[^{]+\{([\s\S]+?})\s*}/g;
const STYLES_HYDRATOR = /\.([^{:]+)(:[^{]+)?{(?:[^}]*;)?([^}]*?)}/g;

const regexps: Partial<Record<StyleBucketName, RegExp>> = {
  k: KEYFRAMES_HYDRATOR,
  t: AT_RULES_HYDRATOR,
  m: AT_RULES_HYDRATOR,
  c: AT_RULES_HYDRATOR,
  x: AT_RULES_HYDRATOR,
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

    // Griffel emits each CSS rule into the document exactly once. In development we track
    // the rules seen while rehydrating, so we can warn if the same rule appears in more than
    // one server-rendered <style> element — a strong signal that styles were flushed into the
    // HTML multiple times (see the warning emitted after the loop).
    const seenRules: Set<string> | undefined = process.env.NODE_ENV !== 'production' ? new Set() : undefined;
    let duplicateRuleCount = 0;

    const cacheRule = (cssRule: string, bucketName: StyleBucketName) => {
      if (seenRules) {
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

      const regex = regexps[bucketName];
      let match;
      let textContent = styleElement.textContent!;

      if (regex) {
        // eslint-disable-next-line no-cond-assign
        while ((match = regex.exec(textContent))) {
          const [cssRule] = match;

          cacheRule(cssRule, bucketName);
        }
      } else {
        // @scope rules can appear in any bucket, so extract them first to prevent
        // STYLES_HYDRATOR from spuriously matching class selectors inside @scope blocks.
        // eslint-disable-next-line no-cond-assign
        while ((match = SCOPE_HYDRATOR.exec(textContent))) {
          const [cssRule] = match;

          cacheRule(cssRule, bucketName);
          textContent = textContent.replace(cssRule, '');
        }

        // eslint-disable-next-line no-cond-assign
        while ((match = STYLES_HYDRATOR.exec(textContent))) {
          const [cssRule] = match;

          cacheRule(cssRule, bucketName);
        }
      }
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
          'Clear the renderer after each flush:',
          '\n\n',
          'useServerInsertedHTML(() => {\n  const styles = renderToStyleElements(renderer);\n  renderer.stylesheets = {};\n  return styles;\n});',
          '\n\n',
          'See https://griffel.js.org/react/guides/ssr-usage for details.',
        ].join(' '),
      );
    }
  }
}
