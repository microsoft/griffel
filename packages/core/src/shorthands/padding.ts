import type { GriffelStylesStrictCSSObject, GriffelStylesCSSValue } from '../types';
import { generateStyles } from './generateStyles';

type PaddingStyle = Pick<GriffelStylesStrictCSSObject, 'paddingTop' | 'paddingRight' | 'paddingBottom' | 'paddingLeft'>;

export function padding(all: GriffelStylesCSSValue): PaddingStyle;
export function padding(vertical: GriffelStylesCSSValue, horizontal: GriffelStylesCSSValue): PaddingStyle;
export function padding(
  top: GriffelStylesCSSValue,
  horizontal: GriffelStylesCSSValue,
  bottom: GriffelStylesCSSValue,
): PaddingStyle;
export function padding(
  top: GriffelStylesCSSValue,
  right: GriffelStylesCSSValue,
  bottom: GriffelStylesCSSValue,
  left: GriffelStylesCSSValue,
): PaddingStyle;

/**
 * A function that implements CSS spec conformant expansion for "padding"
 *
 * @example
 *   padding('10px')
 *   padding('10px', '5px')
 *   padding('2px', '4px', '8px')
 *   padding('1px', 0, '3px', '4px')
 *
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/padding
 */
export function padding(...values: GriffelStylesCSSValue[]): PaddingStyle {
  return generateStyles('padding', '', ...values);
}
