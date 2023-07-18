import type { GriffelStyle } from '@griffel/style-types';

import type { PaddingInlineInput } from './types';
import { validateArguments } from './utils';

type PaddingInlineStyle = Pick<GriffelStyle, 'paddingInlineStart' | 'paddingInlineEnd'>;

/**
 * A function that implements CSS spec conformant expansion for "padding-inline"
 *
 * @example
 *   paddingInline('10px')
 *   paddingInline('10px', '5px')
 *
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/padding-inline
 */
export function paddingInline(start: PaddingInlineInput, end: PaddingInlineInput = start): PaddingInlineStyle {
  validateArguments('paddingInline', arguments);

  return {
    paddingInlineStart: start,
    paddingInlineEnd: end,
  };
}
