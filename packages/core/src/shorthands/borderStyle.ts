import * as CSS from 'csstype';

import type { GriffelStylesStrictCSSObject } from '../types';
import { generateStyles } from './generateStyles';

type BorderStyleStyle = Pick<
  GriffelStylesStrictCSSObject,
  'borderTopStyle' | 'borderRightStyle' | 'borderBottomStyle' | 'borderLeftStyle'
>;

export function borderStyle(all: CSS.Property.BorderStyle): BorderStyleStyle;
export function borderStyle(vertical: CSS.Property.BorderStyle, horizontal: CSS.Property.BorderStyle): BorderStyleStyle;
export function borderStyle(
  top: CSS.Property.BorderStyle,
  horizontal: CSS.Property.BorderStyle,
  bottom: CSS.Property.BorderStyle,
): BorderStyleStyle;
export function borderStyle(
  top: CSS.Property.BorderStyle,
  right: CSS.Property.BorderStyle,
  bottom: CSS.Property.BorderStyle,
  left: CSS.Property.BorderStyle,
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
export function borderStyle(...values: CSS.Property.BorderStyle[]): BorderStyleStyle {
  return generateStyles('border', 'Style', ...values);
}
