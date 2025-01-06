import type { GriffelAnimation, GriffelResetAnimation, GriffelStaticStyle } from '@griffel/style-types';
import { hyphenateProperty } from './hyphenateProperty';

export function cssifyObject<
  Style extends GriffelAnimation['from'] | GriffelResetAnimation['from'] | GriffelStaticStyle,
>(style: Style) {
  let css = '';

  // eslint-disable-next-line guard-for-in
  for (const property in style) {
    const value = style[property as unknown as keyof Style] as unknown;

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
