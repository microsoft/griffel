import type { GriffelStyle } from '@griffel/style-types';
import type { BorderRadiusInput } from './types';

type BorderRadiusStyle =
  | Pick<
      GriffelStyle,
      'borderBottomRightRadius' | 'borderBottomLeftRadius' | 'borderTopRightRadius' | 'borderTopLeftRadius'
    >
  | Pick<GriffelStyle, 'borderRadius'>;

/**
 * A function that implements CSS spec conformant expansion for "borderRadius". "/" is not supported, please use CSS
 * longhands directly.
 *
 * @deprecated Use the "borderRadius" property directly, TODO link
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
  if (Array.isArray(value1) || Array.isArray(value2) || Array.isArray(value3) || Array.isArray(value4)) {
    return {
      borderBottomRightRadius: value3,
      borderBottomLeftRadius: value4,
      borderTopRightRadius: value2,
      borderTopLeftRadius: value1,
    };
  }

  if (value1 === value2 && value1 === value3 && value1 === value4) {
    return {
      borderRadius: value1,
    };
  }

  if (value1 === value3 && value2 === value4) {
    return {
      borderRadius: `${value1} ${value2}`,
    };
  }

  if (value2 === value4) {
    return {
      borderRadius: `${value1} ${value2} ${value3}`,
    };
  }

  return {
    borderRadius: `${value1} ${value2} ${value3} ${value4}`,
  };
}
