import * as CSS from 'csstype';

import type { GriffelStylesStrictCSSObject, ValueOrArray } from '../types';
import { generateStyles } from './generateStyles';

type BorderColorStyle = Pick<
  GriffelStylesStrictCSSObject,
  'borderTopColor' | 'borderRightColor' | 'borderBottomColor' | 'borderLeftColor'
>;

export function borderColor(all: ValueOrArray<CSS.Property.BorderColor>): BorderColorStyle;
export function borderColor(
  vertical: ValueOrArray<CSS.Property.BorderColor>,
  horizontal: ValueOrArray<CSS.Property.BorderColor>,
): BorderColorStyle;
export function borderColor(
  top: ValueOrArray<CSS.Property.BorderColor>,
  horizontal: ValueOrArray<CSS.Property.BorderColor>,
  bottom: ValueOrArray<CSS.Property.BorderColor>,
): BorderColorStyle;
export function borderColor(
  top: ValueOrArray<CSS.Property.BorderColor>,
  right: ValueOrArray<CSS.Property.BorderColor>,
  bottom: ValueOrArray<CSS.Property.BorderColor>,
  left: ValueOrArray<CSS.Property.BorderColor>,
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
export function borderColor(...values: ValueOrArray<CSS.Property.BorderColor>[]): BorderColorStyle {
  return generateStyles<BorderColorStyle>('border', 'Color', ...values);
}
