import type { GriffelStaticStyle } from '@griffel/style-types';

import { cssifyObject } from './utils/cssifyObject';
import { compileCSSRules } from './compileCSSRules';

export function compileStaticCSS(property: string, value: GriffelStaticStyle): string {
  const cssRule = `${property} {${cssifyObject(value)}}`;
  return compileCSSRules(cssRule, false)[0];
}
