import type { GriffelStyle } from '@griffel/style-types';
import type { GapInput } from './types';

type GapStyle = Pick<GriffelStyle, 'gap'> | Pick<GriffelStyle, 'columnGap' | 'rowGap'>;

/**
 * A function that implements CSS spec conformant expansion for "gap"
 *
 * @deprecated Just use the "gap" property directly, TODO link
 *
 * @example
 *   gap('10px')
 *   gap('10px', '5px')
 *
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/gap
 */
export function gap(columnGap: GapInput, rowGap: GapInput = columnGap): GapStyle {
  if (Array.isArray(columnGap) || Array.isArray(rowGap)) {
    return {
      columnGap,
      rowGap,
    };
  }

  if (columnGap === rowGap) {
    return {
      gap: columnGap,
    };
  }

  return {
    gap: `${columnGap} ${rowGap}`,
  };
}
