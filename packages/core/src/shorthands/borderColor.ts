import type { GriffelStyle } from '@griffel/style-types';
import { generateStyles } from './generateStyles';
import type { BorderColorInput } from './types';

type BorderColorStyle = Pick<
  GriffelStyle,
  'borderTopColor' | 'borderRightColor' | 'borderBottomColor' | 'borderLeftColor'
>;

export function borderColor(all: BorderColorInput): BorderColorStyle;
export function borderColor(vertical: BorderColorInput, horizontal: BorderColorInput): BorderColorStyle;
export function borderColor(
  top: BorderColorInput,
  horizontal: BorderColorInput,
  bottom: BorderColorInput,
): BorderColorStyle;
export function borderColor(
  top: BorderColorInput,
  right: BorderColorInput,
  bottom: BorderColorInput,
  left: BorderColorInput,
): BorderColorStyle;

/**
 * A function that implements CSS spec conformant expansion for "borderColor"
 *
 * @example
 *  borderColor('red')
 *  borderColor('red', 'blue')
 *  borderColor('red', 'blue', 'green')
 *  borderColor('red', 'blue', 'green', 'yellow')
 *
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/border-color
 */
export function borderColor(...values: BorderColorInput[]): BorderColorStyle {
  return generateStyles<BorderColorStyle>('border', 'Color', ...values);
}
