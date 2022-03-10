import type { GriffelResetStyle } from '@griffel/style-types';

import { DEBUG_RESET_CLASSES } from './constants';
import { insertionFactory } from './insertionFactory';
import { resolveResetStyleRules } from './runtime/resolveResetStyleRules';
import type { GriffelRenderer } from './types';
import type { GriffelInsertionFactory } from './types';

export interface MakeResetStylesOptions {
  dir: 'ltr' | 'rtl';
  renderer: GriffelRenderer;
}

export function makeResetStyles(styles: GriffelResetStyle, factory: GriffelInsertionFactory = insertionFactory) {
  const insertStyles = factory();

  let ltrClassName: string | null = null;
  let rtlClassName: string | null = null;

  let cssRules: string[] | null = null;

  function computeClassName(options: MakeResetStylesOptions): string {
    const { dir, renderer } = options;

    if (ltrClassName === null) {
      [ltrClassName, rtlClassName, cssRules] = resolveResetStyleRules(styles);
    }

    insertStyles(renderer, { r: cssRules! });

    const className = dir === 'ltr' ? ltrClassName : rtlClassName || ltrClassName;

    if (process.env.NODE_ENV !== 'production') {
      DEBUG_RESET_CLASSES[className] = 1;
    }

    return className;
  }

  return computeClassName;
}
