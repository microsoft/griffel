import type { GriffelStaticStyles } from '@griffel/style-types';

import type { CSSBucketEntry } from '../types';
import { compileCSSRules } from './compileCSSRules';
import { compileStaticCSS } from './compileStaticCSS';

export function resolveStaticStyleRules(stylesSet: GriffelStaticStyles[]): CSSBucketEntry[] {
  return stylesSet.reduce((acc, styles) => {
    if (typeof styles === 'string') {
      const cssRules = compileCSSRules(styles, false);

      for (const rule of cssRules) {
        acc.push(rule);
      }

      return acc;
    }

    // eslint-disable-next-line guard-for-in
    for (const property in styles) {
      const value = styles[property];
      const staticCSS = compileStaticCSS(property, value);

      acc.push(staticCSS);
    }

    return acc;
  }, [] as CSSBucketEntry[]);
}
