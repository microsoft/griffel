import * as CSS from 'csstype';

import type { GriffelStylesStrictCSSObject, GriffelStylesCSSValue } from '../types';
import { generateStyles } from './generateStyles';

type BorderWidthStyle = Pick<
  GriffelStylesStrictCSSObject,
  'borderTopStyle' | 'borderRightStyle' | 'borderBottomStyle' | 'borderLeftStyle'
>;

export function borderWidth(all: CSS.Property.BorderWidth<GriffelStylesCSSValue>): BorderWidthStyle;
export function borderWidth(
  vertical: CSS.Property.BorderWidth<GriffelStylesCSSValue>,
  horizontal: CSS.Property.BorderWidth<GriffelStylesCSSValue>,
): BorderWidthStyle;
export function borderWidth(
  top: CSS.Property.BorderWidth<GriffelStylesCSSValue>,
  horizontal: CSS.Property.BorderWidth<GriffelStylesCSSValue>,
  bottom: CSS.Property.BorderWidth<GriffelStylesCSSValue>,
): BorderWidthStyle;
export function borderWidth(
  top: CSS.Property.BorderWidth<GriffelStylesCSSValue>,
  right: CSS.Property.BorderWidth<GriffelStylesCSSValue>,
  bottom: CSS.Property.BorderWidth<GriffelStylesCSSValue>,
  left: CSS.Property.BorderWidth<GriffelStylesCSSValue>,
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
export function borderWidth(...values: CSS.Property.BorderWidth<GriffelStylesCSSValue>[]): BorderWidthStyle {
  return generateStyles('border', 'Width', ...values);
}
