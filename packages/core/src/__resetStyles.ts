import type { MakeStylesOptions } from './types';

/**
 * @internal
 */
export function __resetStyles(ltrClassName: string, rtlClassName: string | null, cssRules: string[]) {
  const insertionCache: Record<string, boolean> = {};

  function computeClassName(options: MakeStylesOptions): string {
    const { dir, renderer } = options;

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
