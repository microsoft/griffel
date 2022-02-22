import * as CSS from 'csstype';
import type { GriffelStylesStrictCSSObject, GriffelStylesCSSValue } from '../types';

type BorderTopStyle = Pick<GriffelStylesStrictCSSObject, 'borderTopWidth' | 'borderTopStyle' | 'borderTopColor'>;

export function borderTop(width: CSS.Property.BorderWidth<GriffelStylesCSSValue>): BorderTopStyle;
export function borderTop(
  width: CSS.Property.BorderWidth<GriffelStylesCSSValue>,
  style: CSS.Property.BorderStyle,
): BorderTopStyle;
export function borderTop(
  width: CSS.Property.BorderWidth<GriffelStylesCSSValue>,
  style: CSS.Property.BorderStyle,
  color: CSS.Property.BorderColor,
): BorderTopStyle;

/**
 * A function that implements expansion for "border-top", it's simplified - check usage examples.
 *
 * @example
 *  borderTop('2px')
 *  borderTop('2px', 'solid')
 *  borderTop('2px', 'solid', 'red')
 *
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/border-top
 */
export function borderTop(
  ...values: [CSS.Property.BorderWidth<GriffelStylesCSSValue>, CSS.Property.BorderStyle?, CSS.Property.BorderColor?]
): BorderTopStyle {
  return {
    borderTopWidth: values[0],
    ...(values[1] && ({ borderTopStyle: values[1] } as BorderTopStyle)),
    ...(values[2] && { borderTopColor: values[2] }),
  };
}
