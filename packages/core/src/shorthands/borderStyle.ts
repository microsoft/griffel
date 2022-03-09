import type { GriffelStyle } from '@griffel/style-types';
import { generateStyles } from './generateStyles';
import type { BorderStyleInput } from './types';

type BorderStyleStyle = Pick<
  GriffelStyle,
  'borderTopStyle' | 'borderRightStyle' | 'borderBottomStyle' | 'borderLeftStyle'
>;

export function borderStyle(all: BorderStyleInput): BorderStyleStyle;
export function borderStyle(vertical: BorderStyleInput, horizontal: BorderStyleInput): BorderStyleStyle;
export function borderStyle(
  top: BorderStyleInput,
  horizontal: BorderStyleInput,
  bottom: BorderStyleInput,
): BorderStyleStyle;
export function borderStyle(
  top: BorderStyleInput,
  right: BorderStyleInput,
  bottom: BorderStyleInput,
  left: BorderStyleInput,
): BorderStyleStyle;

/**
 * A function that implements CSS spec conformant expansion for "borderStyle"
 *
 * @example
 *  borderStyle('solid')
 *  borderStyle('solid', 'dashed')
 *  borderStyle('solid', 'dashed', 'dotted')
 *  borderStyle('solid', 'dashed', 'dotted', 'double')
 *
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/border-style
 */
export function borderStyle(...values: BorderStyleInput[]): BorderStyleStyle {
  return generateStyles<BorderStyleStyle>('border', 'Style', ...values);
}
