import type { CSSRulesByBucket, GriffelInsertionFactory, GriffelRenderer } from './types.js';

/**
 * Default implementation of insertion factory. Inserts styles only once per renderer and performs
 * insertion immediately after styles computation.
 *
 * @internal
 */
export const insertionFactory: GriffelInsertionFactory = () => {
  // Keyed by renderer instance (not by `renderer.id`) so that entries are released together with renderers, e.g. when
  // a new renderer is created for every SSR request.
  const insertionCache = new WeakSet<GriffelRenderer>();

  return function insertStyles(renderer: GriffelRenderer, cssRules: CSSRulesByBucket) {
    if (!insertionCache.has(renderer)) {
      renderer.insertCSSRules(cssRules!);
      insertionCache.add(renderer);
    }
  };
};
