import type { BorderColorProperty, BorderStyleProperty, BorderWidthProperty } from 'csstype';
import type { GriffelStylesStrictCSSObject, GriffelStylesCSSValue } from '../types';

type BorderLeftStyle = Pick<GriffelStylesStrictCSSObject, 'borderLeftColor' | 'borderLeftStyle' | 'borderLeftWidth'>;

export function borderLeft(width: BorderWidthProperty<GriffelStylesCSSValue>): BorderLeftStyle;
export function borderLeft(
  width: BorderWidthProperty<GriffelStylesCSSValue>,
  style: BorderStyleProperty,
): BorderLeftStyle;
export function borderLeft(
  width: BorderWidthProperty<GriffelStylesCSSValue>,
  style: BorderStyleProperty,
  color: BorderColorProperty,
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
  ...values: [BorderWidthProperty<GriffelStylesCSSValue>, BorderStyleProperty?, BorderColorProperty?]
): BorderLeftStyle {
  return {
    borderLeftWidth: values[0],
    ...(values[1] && ({ borderLeftStyle: values[1] } as GriffelStylesStrictCSSObject)),
    ...(values[2] && { borderLeftColor: values[2] }),
  };
}
