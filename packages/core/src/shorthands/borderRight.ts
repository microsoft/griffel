import type { GriffelStyle } from '@griffel/style-types';

import type { BorderColorInput, BorderStyleInput, BorderWidthInput } from './types';
import { isBorderStyle } from './utils';

type BorderRightStyle = Pick<GriffelStyle, 'borderRightWidth' | 'borderRightStyle' | 'borderRightColor'>;

export function borderRight(width: BorderWidthInput): BorderRightStyle;
export function borderRight(style: BorderStyleInput): BorderRightStyle;
export function borderRight(width: BorderWidthInput, style: BorderStyleInput): BorderRightStyle;
export function borderRight(style: BorderStyleInput, width: BorderWidthInput): BorderRightStyle;
export function borderRight(
  width: BorderWidthInput,
  style: BorderStyleInput,
  color: BorderColorInput,
): BorderRightStyle;
export function borderRight(
  style: BorderStyleInput,
  width: BorderWidthInput,
  color: BorderColorInput,
): BorderRightStyle;

/**
 * A function that implements expansion for "border-right", it's simplified - check usage examples.
 *
 * @example
 *  borderRight('2px')
 *  borderRight('solid')
 *  borderRight('2px', 'solid')
 *  borderRight('solid', '2px')
 *  borderRight('2px', 'solid', 'red')
 *  borderRight('solid', '2px', 'red')
 *
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/border-right
 */
export function borderRight(
  ...values: [BorderWidthInput | BorderStyleInput, (BorderWidthInput | BorderStyleInput)?, BorderColorInput?]
): BorderRightStyle {
  if (isBorderStyle(values[0])) {
    return {
      borderRightStyle: values[0],
      ...(values[1] && { borderRightWidth: values[1] }),
      ...(values[2] && { borderRightColor: values[2] }),
    };
  }

  return {
    borderRightWidth: values[0],
    ...(values[1] && ({ borderRightStyle: values[1] } as BorderRightStyle)),
    ...(values[2] && { borderRightColor: values[2] }),
  };
}
