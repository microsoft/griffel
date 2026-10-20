import { DEBUG_RESET_CLASSES } from './constants.js';
import { insertionFactory } from './insertionFactory.js';
import type { MakeResetStylesOptions } from './makeResetStyles.js';
import type { CSSRulesByBucket, GriffelInsertionFactory } from './types.js';

/**
 * @private
 */
export function __resetStyles(
  ltrClassName: string,
  rtlClassName: string | null,
  cssRules: CSSRulesByBucket | string[],
  factory: GriffelInsertionFactory = insertionFactory,
) {
  const insertStyles = factory();
  // Wrap once: a new object per call would defeat insertion caching and re-run insertion effects on every render
  const insertionRules: CSSRulesByBucket = Array.isArray(cssRules) ? { r: cssRules } : cssRules;

  function computeClassName(options: MakeResetStylesOptions): string {
    const { dir, renderer } = options;
    const className = dir === 'ltr' ? ltrClassName : rtlClassName || ltrClassName;

    insertStyles(renderer, insertionRules);

    if (process.env.NODE_ENV !== 'production') {
      DEBUG_RESET_CLASSES[className] = 1;
    }

    return className;
  }

  return computeClassName;
}
