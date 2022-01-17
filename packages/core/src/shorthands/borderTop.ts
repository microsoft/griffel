import type { BorderColorProperty, BorderStyleProperty, BorderWidthProperty } from 'csstype';
import type { GriffelStylesStrictCSSObject, GriffelStylesCSSValue } from '../types';

type BorderTopStyle = Pick<GriffelStylesStrictCSSObject, 'borderTopWidth' | 'borderTopStyle' | 'borderTopColor'>;

export function borderTop(width: BorderWidthProperty<GriffelStylesCSSValue>): BorderTopStyle;
export function borderTop(
  width: BorderWidthProperty<GriffelStylesCSSValue>,
  style: BorderStyleProperty,
): BorderTopStyle;
export function borderTop(
  width: BorderWidthProperty<GriffelStylesCSSValue>,
  style: BorderStyleProperty,
  color: BorderColorProperty,
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
  ...values: [BorderWidthProperty<GriffelStylesCSSValue>, BorderStyleProperty?, BorderColorProperty?]
): BorderTopStyle {
  return {
    borderTopWidth: values[0],
    ...(values[1] && ({ borderTopStyle: values[1] } as BorderTopStyle)),
    ...(values[2] && { borderTopColor: values[2] }),
  };
}
