import type { GriffelStyle } from '@griffel/style-types';

import type { OutlineColorInput, OutlineStyleInput, OutlineWidthInput } from './types';
import { validateArguments } from './utils';

type OutlineStyle = Pick<GriffelStyle, 'outlineColor' | 'outlineStyle' | 'outlineWidth'>;

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
  validateArguments('outline', arguments);

  return {
    outlineWidth,
    ...(outlineStyle && { outlineStyle }),
    ...(outlineColor && { outlineColor }),
  };
}
