import * as CSS from 'csstype';
import type { GriffelStylesStrictCSSObject, GriffelStylesCSSValue } from '../types';

type BorderLeftStyle = Pick<GriffelStylesStrictCSSObject, 'borderLeftColor' | 'borderLeftStyle' | 'borderLeftWidth'>;

export function borderLeft(width: CSS.Property.BorderWidth<GriffelStylesCSSValue>): BorderLeftStyle;
export function borderLeft(
  width: CSS.Property.BorderWidth<GriffelStylesCSSValue>,
  style: CSS.Property.BorderStyle,
): BorderLeftStyle;
export function borderLeft(
  width: CSS.Property.BorderWidth<GriffelStylesCSSValue>,
  style: CSS.Property.BorderStyle,
  color: CSS.Property.BorderColor,
): BorderLeftStyle;

/**
 * A function that implements expansion for "border-left", it's simplified - check usage examples.
 *
 * @example
 *  borderLeft('2px')
 *  borderLeft('2px', 'solid')
 *  borderLeft('2px', 'solid', 'red')
 *
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/border-left
 */
export function borderLeft(
  ...values: [CSS.Property.BorderWidth<GriffelStylesCSSValue>, CSS.Property.BorderStyle?, CSS.Property.BorderColor?]
): BorderLeftStyle {
  return {
    borderLeftWidth: values[0],
    ...(values[1] && ({ borderLeftStyle: values[1] } as GriffelStylesStrictCSSObject)),
    ...(values[2] && { borderLeftColor: values[2] }),
  };
}
