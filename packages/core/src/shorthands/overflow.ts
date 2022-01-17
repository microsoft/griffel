import type { OverflowProperty } from 'csstype';
import type { GriffelStylesStrictCSSObject } from '../types';

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
export function overflow(overflowX: OverflowProperty, overflowY: OverflowProperty = overflowX): OverflowStyle {
  return {
    overflowX,
    overflowY,
  } as OverflowStyle;
}
