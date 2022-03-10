import type { GriffelStaticStyles } from '@griffel/style-types';

import { insertionFactory } from './insertionFactory';
import { resolveStaticStyleRules } from './runtime/resolveStaticStyleRules';
import type { GriffelRenderer } from './types';
import type { GriffelInsertionFactory } from './types';

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
