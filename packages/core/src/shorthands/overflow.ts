import type { GriffelStyle } from '@griffel/style-types';
import type { OverflowInput } from './types';

type OverflowStyle = Pick<GriffelStyle, 'overflowX' | 'overflowY'> | Pick<GriffelStyle, 'overflow'>;

/**
 * A function that implements CSS spec conformant expansion for "overflow"
 *
 * @deprecated Use the "overflow" property directly, TODO link
 *
 * @example
 *   overflow('hidden')
 *   overflow('hidden', 'scroll')
 *
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/overflow
 */
export function overflow(overflowX: OverflowInput, overflowY: OverflowInput = overflowX): OverflowStyle {
  if (Array.isArray(overflowX) || Array.isArray(overflowY)) {
    return {
      overflowX,
      overflowY,
    } as OverflowStyle;
  }

  if (overflowX === overflowY) {
    return {
      overflow: overflowX,
    };
  }

  return {
    overflow: `${overflowX} ${overflowY}`,
  };
}
