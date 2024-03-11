import type { GriffelStyle } from '@griffel/style-types';
import type { PaddingInlineInput } from './types';

type PaddingInlineStyle =
  | Pick<GriffelStyle, 'paddingInlineStart' | 'paddingInlineEnd'>
  | Pick<GriffelStyle, 'paddingInline'>;

/**
 * A function that implements CSS spec conformant expansion for "padding-inline"
 *
 * @deprecated Just use the "paddingInline" property directly, TODO link
 *
 * @example
 *   paddingInline('10px')
 *   paddingInline('10px', '5px')
 *
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/padding-inline
 */
export function paddingInline(start: PaddingInlineInput, end: PaddingInlineInput = start): PaddingInlineStyle {
  if (Array.isArray(start) || Array.isArray(end)) {
    return {
      paddingInlineStart: start,
      paddingInlineEnd: end,
    };
  }

  if (start === end) {
    return { paddingInline: start };
  }

  return {
    paddingInline: `${start} ${end}`,
  };
}
