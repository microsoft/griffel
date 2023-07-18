import type { GriffelStyle } from '@griffel/style-types';

import type { PaddingBlockInput } from './types';
import { validateArguments } from './utils';

type PaddingBlockStyle = Pick<GriffelStyle, 'paddingBlockStart' | 'paddingBlockEnd'>;

/**
 * A function that implements CSS spec conformant expansion for "padding-block"
 *
 * @example
 *   paddingBlock('10px')
 *   paddingBlock('10px', '5px')
 *
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/padding-block
 */
export function paddingBlock(start: PaddingBlockInput, end: PaddingBlockInput = start): PaddingBlockStyle {
  validateArguments('paddingBlock', arguments);

  return {
    paddingBlockStart: start,
    paddingBlockEnd: end,
  };
}
