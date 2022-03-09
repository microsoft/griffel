import type { GriffelStyle } from '@griffel/style-types';
import { borderWidth } from './borderWidth';
import { borderStyle } from './borderStyle';
import { borderColor } from './borderColor';
import type { BorderColorInput, BorderStyleInput, BorderWidthInput } from './types';

type BorderStyle = Pick<
  GriffelStyle,
  | 'borderTopColor'
  | 'borderTopStyle'
  | 'borderTopWidth'
  | 'borderRightColor'
  | 'borderRightStyle'
  | 'borderRightWidth'
  | 'borderBottomColor'
  | 'borderBottomStyle'
  | 'borderBottomWidth'
  | 'borderLeftColor'
  | 'borderLeftStyle'
  | 'borderLeftWidth'
>;

export function border(width: BorderWidthInput): BorderStyle;
export function border(width: BorderWidthInput, style: BorderStyleInput): BorderStyle;
export function border(width: BorderWidthInput, style: BorderStyleInput, color: BorderColorInput): BorderStyle;

/**
 * A function that implements expansion for "border" to all sides of an element, it's simplified - check usage examples.
 *
 * @example
 *  border('2px')
 *  border('2px', 'solid')
 *  border('2px', 'solid', 'red')
 *
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/border
 */
export function border(...values: [BorderWidthInput, BorderStyleInput?, BorderColorInput?]): BorderStyle {
  return {
    ...borderWidth(values[0]),
    ...(values[1] && borderStyle(values[1])),
    ...(values[2] && borderColor(values[2])),
  };
}
