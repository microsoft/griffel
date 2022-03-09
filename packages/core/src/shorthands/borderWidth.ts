import type { GriffelStyle } from '@griffel/style-types';
import { generateStyles } from './generateStyles';
import { BorderWidthInput } from './types';

type BorderWidthStyle = Pick<
  GriffelStyle,
  'borderTopStyle' | 'borderRightStyle' | 'borderBottomStyle' | 'borderLeftStyle'
>;

export function borderWidth(all: BorderWidthInput): BorderWidthStyle;
export function borderWidth(vertical: BorderWidthInput, horizontal: BorderWidthInput): BorderWidthStyle;
export function borderWidth(
  top: BorderWidthInput,
  horizontal: BorderWidthInput,
  bottom: BorderWidthInput,
): BorderWidthStyle;
export function borderWidth(
  top: BorderWidthInput,
  right: BorderWidthInput,
  bottom: BorderWidthInput,
  left: BorderWidthInput,
): BorderWidthStyle;

/**
 * A function that implements CSS spec conformant expansion for "borderWidth"
 *
 * @example
 *   borderWidth('10px')
 *   borderWidth('10px', '5px')
 *   borderWidth('2px', '4px', '8px')
 *   borderWidth('1px', 0, '3px', '4px')
 *
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/border-width
 */
export function borderWidth(...values: BorderWidthInput[]): BorderWidthStyle {
  return generateStyles<BorderWidthStyle>('border', 'Width', ...values);
}
