import type { GriffelStyle } from '@griffel/style-types';
import type { MarginInlineInput } from './types';

type MarginInlineStyle = Pick<GriffelStyle, 'marginInlineStart' | 'marginInlineEnd'>;

/**
 * A function that implements CSS spec conformant expansion for "margin-inline"
 *
 * @example
 *   marginInline('10px')
 *   marginInline('10px', '5px')
 *
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/margin-inline
 */
export function marginInline(start: MarginInlineInput, end: MarginInlineInput = start): MarginInlineStyle {
  return {
    marginInlineStart: start,
    marginInlineEnd: end,
  };
}
