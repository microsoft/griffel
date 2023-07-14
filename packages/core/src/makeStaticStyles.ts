import type { GriffelStaticStyles } from '@griffel/style-types';

import { resolveStaticStyleRules } from './runtime/resolveStaticStyleRules';
import type { GriffelRenderer } from './types';

export interface MakeStaticStylesOptions {
  renderer: GriffelRenderer;
}

/**
 * Register static css.
 * @param styles - styles object or string.
 */
export function makeStaticStyles(styles: GriffelStaticStyles | GriffelStaticStyles[]) {
  const styleCache: Record<string, true> = {};
  const stylesSet: GriffelStaticStyles[] = Array.isArray(styles) ? styles : [styles];

  function useStaticStyles(options: MakeStaticStylesOptions): void {
    const cacheKey = options.renderer.id;
    if (styleCache[cacheKey]) {
      return;
    }

    for (const styleRules of stylesSet) {
      options.renderer.insertCSSRules(resolveStaticStyleRules(styleRules));
    }

    styleCache[cacheKey] = true;
  }

  return useStaticStyles;
}
