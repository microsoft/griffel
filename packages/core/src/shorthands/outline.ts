import type { GriffelStyle } from '@griffel/style-types';
import type { OutlineColorInput, OutlineStyleInput, OutlineWidthInput } from './types';

type OutlineStyle = Pick<GriffelStyle, 'outlineColor' | 'outlineStyle' | 'outlineWidth'>;

/** @deprecated Use `{ outline: '2px' }` instead as Griffel supports CSS shorthands now */
export function outline(width: OutlineWidthInput): OutlineStyle;
/** @deprecated Use `{ outline: '2px solid' }` instead as Griffel supports CSS shorthands now */
export function outline(width: OutlineWidthInput, style: OutlineStyleInput): OutlineStyle;
/** @deprecated Use `{ outline: '2px solid red' }` instead as Griffel supports CSS shorthands now */
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
 * @deprecated Just use `{ outline: '2px solid red' }` instead as Griffel supports CSS shorthands now
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
