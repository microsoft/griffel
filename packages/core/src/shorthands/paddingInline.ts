import type { GriffelStyle } from '@griffel/style-types';
import type { PaddingInlineInput } from './types';

type PaddingInlineStyle = Pick<GriffelStyle, 'paddingInlineStart' | 'paddingInlineEnd'>;

/**
 * A function that implements CSS spec conformant expansion for "padding-inline"
 *
 * @example
 *   paddingInline('10px')
 *   paddingInline('10px', '5px')
 *
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/padding-inline
 *
 * @deprecated Just use `{ paddingInline: '10px' }` instead as Griffel supports CSS shorthands now
 */
export function paddingInline(start: PaddingInlineInput, end: PaddingInlineInput = start): PaddingInlineStyle {
  return {
    paddingInlineStart: start,
    paddingInlineEnd: end,
  };
}
