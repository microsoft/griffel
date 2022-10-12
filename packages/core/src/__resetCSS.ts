import type { MakeStylesOptions } from './types';

/**
 * @internal
 */
export function __resetCSS(ltrClassName: string, rtlClassName: string | null) {
  function computeClassName(options: Pick<MakeStylesOptions, 'dir'>): string {
    const { dir } = options;

    return dir === 'ltr' ? ltrClassName : rtlClassName || ltrClassName;
  }

  return computeClassName;
}
