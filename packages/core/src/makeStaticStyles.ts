import { resolveStaticStyleRules } from './runtime/resolveStaticStyleRules';
import { GriffelStaticStylesOptions, GriffelStaticStyles } from './types';

/**
 * Register static css.
 * @param styles - styles object or string.
 */
export function makeStaticStyles(styles: GriffelStaticStyles | GriffelStaticStyles[]) {
  const styleCache: Record<string, true> = {};
  const stylesSet: GriffelStaticStyles[] = Array.isArray(styles) ? styles : [styles];

  function useStaticStyles(options: GriffelStaticStylesOptions): void {
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
