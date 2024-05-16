import type { GriffelStaticStyle, GriffelStyle } from '@griffel/style-types';
import { hyphenateProperty } from './hyphenateProperty';

export function cssifyObject(style: GriffelStyle | GriffelStaticStyle) {
  let css = '';

  // eslint-disable-next-line guard-for-in
  for (const property in style) {
    const value = style[property as keyof GriffelStyle];
    if (typeof value === 'string' || typeof value === 'number') {
      css += hyphenateProperty(property) + ':' + value + ';';
      continue;
    }
    if (Array.isArray(value)) {
      for (const arrValue of value) {
        css += hyphenateProperty(property) + ':' + arrValue + ';';
      }
    }
  }

  return css;
}
