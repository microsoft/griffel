import type { GriffelStylesStrictCSSObject } from '../types';
import { GapInput } from './types';

type GapStyle = Pick<GriffelStylesStrictCSSObject, 'columnGap' | 'rowGap'>;

/**
 * A function that implements CSS spec conformant expansion for "gap"
 *
 * @example
 *   gap('10px')
 *   gap('10px', '5px')
 *
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/gap
 */
export function gap(columnGap: GapInput, rowGap: GapInput = columnGap): GapStyle {
  return {
    columnGap,
    rowGap,
  };
}
