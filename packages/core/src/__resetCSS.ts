import { DEBUG_RESET_CLASSES } from './constants';
import type { MakeStylesOptions } from './types';

/**
 * @internal
 */
export function __resetCSS(ltrClassName: string, rtlClassName: string | null) {
  function computeClassName(options: Pick<MakeStylesOptions, 'dir'>): string {
    const { dir } = options;
    const className = dir === 'ltr' ? ltrClassName : rtlClassName || ltrClassName;

    if (process.env.NODE_ENV !== 'production') {
      DEBUG_RESET_CLASSES[className] = 1;
    }

    return className;
  }

  return computeClassName;
}
