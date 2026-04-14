import type { GriffelStaticStyles } from '@griffel/style-types';

import { insertionFactory } from './insertionFactory.js';
import { resolveStaticStyleRules } from './runtime/resolveStaticStyleRules.js';
import type { GriffelRenderer } from './types.js';
import type { GriffelInsertionFactory } from './types.js';

export interface MakeStaticStylesOptions {
  renderer: GriffelRenderer;
}

export function makeStaticStyles(
  styles: GriffelStaticStyles | GriffelStaticStyles[],
  factory: GriffelInsertionFactory = insertionFactory,
) {
  const insertStyles = factory();
  const stylesSet: GriffelStaticStyles[] = Array.isArray(styles) ? styles : [styles];

  function useStaticStyles(options: MakeStaticStylesOptions): void {
    insertStyles(
      options.renderer,
      // 👇 static rules should be inserted into default bucket
      { d: resolveStaticStyleRules(stylesSet) },
    );
  }

  return useStaticStyles;
}
