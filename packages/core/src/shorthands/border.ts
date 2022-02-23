import * as CSS from 'csstype';

import type { GriffelStylesStrictCSSObject, GriffelStylesCSSValue, ValueOrArray } from '../types';
import { borderWidth } from './borderWidth';
import { borderStyle } from './borderStyle';
import { borderColor } from './borderColor';

type BorderStyle = Pick<
  GriffelStylesStrictCSSObject,
  | 'borderTopColor'
  | 'borderTopStyle'
  | 'borderTopWidth'
  | 'borderRightColor'
  | 'borderRightStyle'
  | 'borderRightWidth'
  | 'borderBottomColor'
  | 'borderBottomStyle'
  | 'borderBottomWidth'
  | 'borderLeftColor'
  | 'borderLeftStyle'
  | 'borderLeftWidth'
>;

export function border(width: ValueOrArray<CSS.Property.BorderWidth<GriffelStylesCSSValue>>): BorderStyle;
export function border(
  width: ValueOrArray<CSS.Property.BorderWidth<GriffelStylesCSSValue>>,
  style: ValueOrArray<CSS.Property.BorderStyle>,
): BorderStyle;
export function border(
  width: ValueOrArray<CSS.Property.BorderWidth<GriffelStylesCSSValue>>,
  style: ValueOrArray<CSS.Property.BorderStyle>,
  color: ValueOrArray<CSS.Property.BorderColor>,
): BorderStyle;

/**
 * A function that implements expansion for "border" to all sides of an element, it's simplified - check usage examples.
 *
 * @example
 *  border('2px')
 *  border('2px', 'solid')
 *  border('2px', 'solid', 'red')
 *
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/border
 */
export function border(
  ...values: [
    ValueOrArray<CSS.Property.BorderWidth<GriffelStylesCSSValue>>,
    ValueOrArray<CSS.Property.BorderStyle>?,
    ValueOrArray<CSS.Property.BorderColor>?,
  ]
): BorderStyle {
  return {
    ...borderWidth(values[0]),
    ...(values[1] && borderStyle(values[1])),
    ...(values[2] && borderColor(values[2])),
  };
}
