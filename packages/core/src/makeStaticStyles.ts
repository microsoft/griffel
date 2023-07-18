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
    const { renderer } = options;
    const cacheKey = renderer.id;

    if (!styleCache[cacheKey]) {
      renderer.insertCSSRules({
        // 👇 static rules should be inserted into default bucket
        d: resolveStaticStyleRules(stylesSet),
      });
      styleCache[cacheKey] = true;
    }
  }

  return useStaticStyles;
}
