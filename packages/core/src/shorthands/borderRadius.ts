import type { GriffelStyle } from '@griffel/style-types';

import type { BorderRadiusInput } from './types';
import { validateArguments } from './utils';

type BorderRadiusStyle = Pick<
  GriffelStyle,
  'borderBottomRightRadius' | 'borderBottomLeftRadius' | 'borderTopRightRadius' | 'borderTopLeftRadius'
>;

/**
 * A function that implements CSS spec conformant expansion for "borderRadius". "/" is not supported, please use CSS
 * longhands directly.
 *
 * @example
 *   borderRadius('10px')
 *   borderRadius('10px', '5%')
 *   borderRadius('2px', '4px', '8px')
 *   borderRadius('1px', 0, '3px', '4px')
 *
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/border-radius
 */
export function borderRadius(
  value1: BorderRadiusInput,
  value2: BorderRadiusInput = value1,
  value3: BorderRadiusInput = value1,
  value4: BorderRadiusInput = value2,
): BorderRadiusStyle {
  validateArguments('borderRadius', arguments);

  return {
    borderBottomRightRadius: value3,
    borderBottomLeftRadius: value4,
    borderTopRightRadius: value2,
    borderTopLeftRadius: value1,
  };
}
