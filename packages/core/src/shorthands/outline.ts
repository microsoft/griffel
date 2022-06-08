import type { GriffelStylesStrictCSSObject } from '../types';
import { OutlineColorInput, OutlineStyleInput, OutlineWidthInput } from './types';

type OutlineStyle = Pick<GriffelStylesStrictCSSObject, 'outlineColor' | 'outlineStyle' | 'outlineWidth'>;

export function outline(width: OutlineWidthInput): OutlineStyle;
export function outline(width: OutlineWidthInput, style: OutlineStyleInput): OutlineStyle;
export function outline(width: OutlineWidthInput, style: OutlineStyleInput, color: OutlineColorInput): OutlineStyle;

/**
 * A function that implements expansion for "outline", it's simplified - check usage examples.
 *
 * @example
 *  outline('2px')
 *  outline('2px', 'solid')
 *  outline('2px', 'solid', 'red')
 *
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/outline
 *
 */
export function outline(
  outlineWidth: OutlineWidthInput,
  outlineStyle?: OutlineStyleInput,
  outlineColor?: OutlineColorInput,
): OutlineStyle {
  return {
    outlineWidth,
    ...(outlineStyle && { outlineStyle }),
    ...(outlineColor && { outlineColor }),
  };
}
