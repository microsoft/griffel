import { resolveResetStyleRules } from './runtime/resolveResetStyleRules';
import type { GriffelResetStyle, MakeStylesOptions } from './types';

/**
 * @internal
 */
export function makeResetStyles(styles: GriffelResetStyle) {
  const insertionCache: Record<string, boolean> = {};

  let ltrClassName: string | null = null;
  let rtlClassName: string | null = null;

  let cssRules: string[] | null = null;

  function computeClassName(options: MakeStylesOptions): string {
    const { dir, renderer } = options;

    if (ltrClassName === null) {
      [ltrClassName, rtlClassName, cssRules] = resolveResetStyleRules(styles);
    }

    const isLTR = dir === 'ltr';
    // As RTL classes are different they should have a different cache key for insertion
    const rendererId = isLTR ? renderer.id : renderer.id + 'r';

    if (insertionCache[rendererId] === undefined) {
      renderer.insertCSSRules({ r: cssRules! });
      insertionCache[rendererId] = true;
    }

    return isLTR ? ltrClassName : rtlClassName || ltrClassName;
  }

  return computeClassName;
}
