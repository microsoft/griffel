import { insertionFactory } from './insertionFactory.js';
import type { CSSRulesByBucket, GriffelInsertionFactory } from './types.js';
import type { MakeStaticStylesOptions } from './makeStaticStyles.js';

/**
 * A version of makeStaticStyles() that accepts build output as an input and skips all runtime transforms.
 *
 * @private
 */
export function __staticStyles(cssRules: CSSRulesByBucket, factory: GriffelInsertionFactory = insertionFactory) {
  const insertStyles = factory();

  function useStaticStyles(options: MakeStaticStylesOptions): void {
    insertStyles(options.renderer, cssRules);
  }

  return useStaticStyles;
}
