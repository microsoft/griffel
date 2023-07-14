import { DEBUG_RESET_CLASSES } from './constants';
import type { MakeResetStylesOptions } from './makeResetStyles';

/**
 * @internal
 */
export function __resetStyles(ltrClassName: string, rtlClassName: string | null, cssRules: string[]) {
  const insertionCache: Record<string, boolean> = {};

  function computeClassName(options: MakeResetStylesOptions): string {
    const { dir, renderer } = options;

    const isLTR = dir === 'ltr';
    // As RTL classes are different they should have a different cache key for insertion
    const rendererId = isLTR ? renderer.id : renderer.id + 'r';

    if (insertionCache[rendererId] === undefined) {
      renderer.insertCSSRules({ r: cssRules! });
      insertionCache[rendererId] = true;
    }

    const className = isLTR ? ltrClassName : rtlClassName || ltrClassName;

    if (process.env.NODE_ENV !== 'production') {
      DEBUG_RESET_CLASSES[className] = 1;
    }

    return className;
  }

  return computeClassName;
}
