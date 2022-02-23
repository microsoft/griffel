import * as CSS from 'csstype';

import type { GriffelStylesStrictCSSObject, ValueOrArray } from '../types';
import { generateStyles } from './generateStyles';

type BorderStyleStyle = Pick<
  GriffelStylesStrictCSSObject,
  'borderTopStyle' | 'borderRightStyle' | 'borderBottomStyle' | 'borderLeftStyle'
>;

export function borderStyle(all: ValueOrArray<CSS.Property.BorderStyle>): BorderStyleStyle;
export function borderStyle(
  vertical: ValueOrArray<CSS.Property.BorderStyle>,
  horizontal: ValueOrArray<CSS.Property.BorderStyle>,
): BorderStyleStyle;
export function borderStyle(
  top: ValueOrArray<CSS.Property.BorderStyle>,
  horizontal: ValueOrArray<CSS.Property.BorderStyle>,
  bottom: ValueOrArray<CSS.Property.BorderStyle>,
): BorderStyleStyle;
export function borderStyle(
  top: ValueOrArray<CSS.Property.BorderStyle>,
  right: ValueOrArray<CSS.Property.BorderStyle>,
  bottom: ValueOrArray<CSS.Property.BorderStyle>,
  left: ValueOrArray<CSS.Property.BorderStyle>,
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
export function borderStyle(...values: ValueOrArray<CSS.Property.BorderStyle>[]): BorderStyleStyle {
  return generateStyles<BorderStyleStyle>('border', 'Style', ...values);
}
