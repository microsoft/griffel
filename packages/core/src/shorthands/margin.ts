import type { GriffelStylesStrictCSSObject, GriffelStylesCSSValue } from '../types';
import { generateStyles } from './generateStyles';

type MarginStyle = Pick<GriffelStylesStrictCSSObject, 'marginTop' | 'marginRight' | 'marginBottom' | 'marginLeft'>;

export function margin(all: GriffelStylesCSSValue): MarginStyle;
export function margin(vertical: GriffelStylesCSSValue, horizontal: GriffelStylesCSSValue): MarginStyle;
export function margin(
  top: GriffelStylesCSSValue,
  horizontal: GriffelStylesCSSValue,
  bottom: GriffelStylesCSSValue,
): MarginStyle;
export function margin(
  top: GriffelStylesCSSValue,
  right: GriffelStylesCSSValue,
  bottom: GriffelStylesCSSValue,
  left: GriffelStylesCSSValue,
): MarginStyle;

/**
 * A function that implements CSS spec conformant expansion for "margin"
 *
 * @example
 *   margin('10px')
 *   margin('10px', '5px')
 *   margin('2px', '4px', '8px')
 *   margin('1px', 0, '3px', '4px')
 *
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/margin
 */
export function margin(...values: GriffelStylesCSSValue[]): MarginStyle {
  return generateStyles<MarginStyle>('margin', '', ...values);
}
