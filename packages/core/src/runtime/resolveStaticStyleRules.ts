import { GriffelStaticStyles, CSSRuleData } from '../types';
import { compileStaticCSS } from './compileStaticCSS';
import { compileCSSRules } from './compileCSS';

export function resolveStaticStyleRules(styles: GriffelStaticStyles, result: CSSRuleData[] = []): CSSRuleData[] {
  if (typeof styles === 'string') {
    const cssRules = compileCSSRules(styles);

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

function addResolvedStyles(cssRule: string, result: CSSRuleData[] = []): void {
  result.push([cssRule, 'd']);
}
