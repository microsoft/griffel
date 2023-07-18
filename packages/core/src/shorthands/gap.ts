import type { GriffelStyle } from '@griffel/style-types';
import type { GapInput } from './types';
import { validateArguments } from './utils';

type GapStyle = Pick<GriffelStyle, 'columnGap' | 'rowGap'>;

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
  validateArguments('gap', arguments);

  return {
    columnGap,
    rowGap,
  };
}
