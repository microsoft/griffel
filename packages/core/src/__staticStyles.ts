import { insertionFactory } from './insertionFactory';
import type { CSSRulesByBucket, GriffelInsertionFactory } from './types';
import type { MakeStaticStylesOptions } from './makeStaticStyles';

/**
 * A version of makeStaticStyles() that accepts build output as an input and skips all runtime transforms.
 *
 * @internal
 */
export function __staticStyles(cssRules: CSSRulesByBucket, factory: GriffelInsertionFactory = insertionFactory) {
  const insertStyles = factory();

  function useStaticStyles(options: MakeStaticStylesOptions): void {
    insertStyles(options.renderer, cssRules);
  }

  return useStaticStyles;
}
