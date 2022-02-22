import * as CSS from 'csstype';

import type { GriffelStylesStrictCSSObject } from '../types';
import { generateStyles } from './generateStyles';

type BorderColorStyle = Pick<
  GriffelStylesStrictCSSObject,
  'borderTopColor' | 'borderRightColor' | 'borderBottomColor' | 'borderLeftColor'
>;

export function borderColor(all: CSS.Property.BorderColor): BorderColorStyle;
export function borderColor(vertical: CSS.Property.BorderColor, horizontal: CSS.Property.BorderColor): BorderColorStyle;
export function borderColor(
  top: CSS.Property.BorderColor,
  horizontal: CSS.Property.BorderColor,
  bottom: CSS.Property.BorderColor,
): BorderColorStyle;
export function borderColor(
  top: CSS.Property.BorderColor,
  right: CSS.Property.BorderColor,
  bottom: CSS.Property.BorderColor,
  left: CSS.Property.BorderColor,
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
export function borderColor(...values: CSS.Property.BorderColor[]): BorderColorStyle {
  return generateStyles<BorderColorStyle>('border', 'Color', ...values);
}
