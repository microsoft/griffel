import type { GriffelStylesStrictCSSObject } from '../types';
import { PaddingBlockInput } from './types';

type PaddingBlockStyle = Pick<GriffelStylesStrictCSSObject, 'paddingBlockStart' | 'paddingBlockEnd'>;

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
  return {
    paddingBlockStart: start,
    paddingBlockEnd: end,
  };
}
