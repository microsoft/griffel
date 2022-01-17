import type { BorderWidthProperty } from 'csstype';

import type { GriffelStylesStrictCSSObject, GriffelStylesCSSValue } from '../types';
import { generateStyles } from './generateStyles';

type BorderWidthStyle = Pick<
  GriffelStylesStrictCSSObject,
  'borderTopStyle' | 'borderRightStyle' | 'borderBottomStyle' | 'borderLeftStyle'
>;

export function borderWidth(all: BorderWidthProperty<GriffelStylesCSSValue>): BorderWidthStyle;
export function borderWidth(
  vertical: BorderWidthProperty<GriffelStylesCSSValue>,
  horizontal: BorderWidthProperty<GriffelStylesCSSValue>,
): BorderWidthStyle;
export function borderWidth(
  top: BorderWidthProperty<GriffelStylesCSSValue>,
  horizontal: BorderWidthProperty<GriffelStylesCSSValue>,
  bottom: BorderWidthProperty<GriffelStylesCSSValue>,
): BorderWidthStyle;
export function borderWidth(
  top: BorderWidthProperty<GriffelStylesCSSValue>,
  right: BorderWidthProperty<GriffelStylesCSSValue>,
  bottom: BorderWidthProperty<GriffelStylesCSSValue>,
  left: BorderWidthProperty<GriffelStylesCSSValue>,
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
export function borderWidth(...values: BorderWidthProperty<GriffelStylesCSSValue>[]): BorderWidthStyle {
  return generateStyles('border', 'Width', ...values);
}
