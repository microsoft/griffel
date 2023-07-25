import type { CSSRulesByBucket, GriffelInsertionFactory, GriffelRenderer } from './types';

/**
 * Default implementation of insertion factory. Inserts styles only once per renderer and performs
 * insertion immediately after styles computation.
 *
 * @internal
 */
export const insertionFactory: GriffelInsertionFactory = () => {
  const insertionCache: Record<string, boolean> = {};

  return function insertStyles(renderer: GriffelRenderer, cssRules: CSSRulesByBucket) {
    if (insertionCache[renderer.id] === undefined) {
      renderer.insertCSSRules(cssRules!);
      insertionCache[renderer.id] = true;
    }
  };
};
