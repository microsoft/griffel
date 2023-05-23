import type { GriffelStaticStyles, CSSRulesByBucket } from '../types';
import { compileCSSRules } from './compileCSSRules';
import { compileStaticCSS } from './compileStaticCSS';

export function resolveStaticStyleRules(styles: GriffelStaticStyles, result: CSSRulesByBucket = {}): CSSRulesByBucket {
  if (typeof styles === 'string') {
    const cssRules = compileCSSRules(styles, false);

    for (const rule of cssRules) {
      addResolvedStyles(rule, result);
    }
  } else {
    // eslint-disable-next-line guard-for-in
    for (const property in styles) {
      const value = styles[property];
      const staticCSS = compileStaticCSS(property, value);

      addResolvedStyles(staticCSS, result);
    }
  }

  return result;
}

function addResolvedStyles(cssRule: string, result: CSSRulesByBucket = {}): void {
  // 👇 static rules should be inserted into default bucket
  result.d = result.d || [];
  result.d.push(cssRule);
}
