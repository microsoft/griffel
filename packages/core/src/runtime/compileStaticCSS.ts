import type { GriffelStaticStyle } from '@griffel/style-types';

import { cssifyObject } from './utils/cssifyObject.js';
import { compileCSSRules } from './compileCSSRules.js';

export function compileStaticCSS(property: string, value: GriffelStaticStyle): string {
  const cssRule = `${property} {${cssifyObject(value)}}`;
  return compileCSSRules(cssRule, false)[0];
}
