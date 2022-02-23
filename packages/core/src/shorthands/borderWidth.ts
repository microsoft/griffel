import * as CSS from 'csstype';

import type { GriffelStylesStrictCSSObject, GriffelStylesCSSValue, ValueOrArray } from '../types';
import { generateStyles } from './generateStyles';

type BorderWidthStyle = Pick<
  GriffelStylesStrictCSSObject,
  'borderTopStyle' | 'borderRightStyle' | 'borderBottomStyle' | 'borderLeftStyle'
>;

export function borderWidth(all: ValueOrArray<CSS.Property.BorderWidth<GriffelStylesCSSValue>>): BorderWidthStyle;
export function borderWidth(
  vertical: ValueOrArray<CSS.Property.BorderWidth<GriffelStylesCSSValue>>,
  horizontal: ValueOrArray<CSS.Property.BorderWidth<GriffelStylesCSSValue>>,
): BorderWidthStyle;
export function borderWidth(
  top: ValueOrArray<CSS.Property.BorderWidth<GriffelStylesCSSValue>>,
  horizontal: ValueOrArray<CSS.Property.BorderWidth<GriffelStylesCSSValue>>,
  bottom: ValueOrArray<CSS.Property.BorderWidth<GriffelStylesCSSValue>>,
): BorderWidthStyle;
export function borderWidth(
  top: ValueOrArray<CSS.Property.BorderWidth<GriffelStylesCSSValue>>,
  right: ValueOrArray<CSS.Property.BorderWidth<GriffelStylesCSSValue>>,
  bottom: ValueOrArray<CSS.Property.BorderWidth<GriffelStylesCSSValue>>,
  left: ValueOrArray<CSS.Property.BorderWidth<GriffelStylesCSSValue>>,
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
export function borderWidth(
  ...values: ValueOrArray<CSS.Property.BorderWidth<GriffelStylesCSSValue>>[]
): BorderWidthStyle {
  return generateStyles<BorderWidthStyle>('border', 'Width', ...values);
}
