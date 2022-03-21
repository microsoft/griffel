import type { GriffelStylesStrictCSSObject } from '../types';
import { OverflowInput } from './types';

type OverflowStyle = Pick<GriffelStylesStrictCSSObject, 'overflowX' | 'overflowY'>;

/**
 * A function that implements CSS spec conformant expansion for "overflow"
 *
 * @example
 *   overflow('hidden')
 *   overflow('hidden', 'scroll')
 *
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/overflow
 */
export function overflow(overflowX: OverflowInput, overflowY: OverflowInput = overflowX): OverflowStyle {
  return {
    overflowX,
    overflowY,
  } as OverflowStyle;
}
