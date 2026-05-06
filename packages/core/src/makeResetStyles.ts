import type { GriffelResetStyle } from '@griffel/style-types';

import { DEBUG_RESET_CLASSES } from './constants.js';
import { insertionFactory } from './insertionFactory.js';
import { resolveResetStyleRules } from './runtime/resolveResetStyleRules.js';
import { logError } from './runtime/warnings/logError.js';
import type { CSSRulesByBucket, GriffelRenderer, GriffelInsertionFactory } from './types.js';

export interface MakeResetStylesOptions {
  dir: 'ltr' | 'rtl';
  renderer: GriffelRenderer;
}

export function makeResetStyles(styles: GriffelResetStyle, factory: GriffelInsertionFactory = insertionFactory) {
  const insertStyles = factory();

  let ltrClassName: string | null = null;
  let rtlClassName: string | null = null;

  let cssRules: CSSRulesByBucket | string[] | null = null;
  let classNameHashSalt: string;

  function computeClassName(options: MakeResetStylesOptions): string {
    const { dir, renderer } = options;

    if (ltrClassName === null) {
      [ltrClassName, rtlClassName, cssRules] = resolveResetStyleRules(styles, renderer.classNameHashSalt);

      if (process.env.NODE_ENV !== 'production') {
        if (renderer.classNameHashSalt) {
          if (classNameHashSalt !== renderer.classNameHashSalt) {
            logError(
              [
                '@griffel/core:',
                '\n\n',
                'A provided renderer has different "classNameHashSalt".',
                'This is not supported and WILL cause issues with classnames generation.',
                'Ensure that all renderers created with "createDOMRenderer()" have the same "classNameHashSalt".',
              ].join(' '),
            );
          }

          classNameHashSalt = renderer.classNameHashSalt;
        }
      }
    }

    insertStyles(renderer, Array.isArray(cssRules) ? { r: cssRules! } : cssRules!);

    const className = dir === 'ltr' ? ltrClassName : rtlClassName || ltrClassName;

    if (process.env.NODE_ENV !== 'production') {
      DEBUG_RESET_CLASSES[className] = 1;
    }

    return className;
  }

  return computeClassName;
}
