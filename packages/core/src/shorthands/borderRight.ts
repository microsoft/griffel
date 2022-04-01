import type { GriffelStylesStrictCSSObject } from '../types';
import { BorderColorInput, BorderStyleInput, BorderWidthInput } from './types';

type BorderRightStyle = Pick<
  GriffelStylesStrictCSSObject,
  'borderRightWidth' | 'borderRightStyle' | 'borderRightColor'
>;

export function borderRight(width: BorderWidthInput): BorderRightStyle;
export function borderRight(width: BorderWidthInput, style: BorderStyleInput): BorderRightStyle;
export function borderRight(
  width: BorderWidthInput,
  style: BorderStyleInput,
  color: BorderColorInput,
): BorderRightStyle;

/**
 * A function that implements expansion for "border-right", it's simplified - check usage examples.
 *
 * @example
 *  borderRight('2px')
 *  borderRight('2px', 'solid')
 *  borderRight('2px', 'solid', 'red')
 *
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/border-right
 */
export function borderRight(...values: [BorderWidthInput, BorderStyleInput?, BorderColorInput?]): BorderRightStyle {
  return {
    borderRightWidth: values[0],
    ...(values[1] && ({ borderRightStyle: values[1] } as BorderRightStyle)),
    ...(values[2] && { borderRightColor: values[2] }),
  };
}
