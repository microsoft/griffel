import type { GriffelStylesStrictCSSObject } from '../types';
import { MarginBlockInput } from './types';

type MarginBlockStyle = Pick<GriffelStylesStrictCSSObject, 'marginBlockStart' | 'marginBlockEnd'>;

/**
 * A function that implements CSS spec conformant expansion for "margin-block"
 *
 * @example
 *   marginBlock('10px')
 *   marginBlock('10px', '5px')
 *
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/margin-block
 */
export function marginBlock(start: MarginBlockInput, end: MarginBlockInput = start): MarginBlockStyle {
  return {
    marginBlockStart: start,
    marginBlockEnd: end,
  };
}
