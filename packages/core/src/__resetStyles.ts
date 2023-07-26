import { DEBUG_RESET_CLASSES } from './constants';
import { insertionFactory } from './insertionFactory';
import type { MakeResetStylesOptions } from './makeResetStyles';
import type { CSSRulesByBucket, GriffelInsertionFactory } from './types';

/**
 * @internal
 */
export function __resetStyles(
  ltrClassName: string,
  rtlClassName: string | null,
  cssRules: CSSRulesByBucket | string[],
  factory: GriffelInsertionFactory = insertionFactory,
) {
  const insertStyles = factory();

  function computeClassName(options: MakeResetStylesOptions): string {
    const { dir, renderer } = options;
    const className = dir === 'ltr' ? ltrClassName : rtlClassName || ltrClassName;

    insertStyles(renderer, Array.isArray(cssRules) ? { r: cssRules! } : cssRules!);

    if (process.env.NODE_ENV !== 'production') {
      DEBUG_RESET_CLASSES[className] = 1;
    }

    return className;
  }

  return computeClassName;
}
