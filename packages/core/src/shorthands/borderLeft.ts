import type { GriffelStyle } from '@griffel/style-types';
import type { BorderColorInput, BorderStyleInput, BorderWidthInput } from './types';

type BorderLeftStyle = Pick<GriffelStyle, 'borderLeftColor' | 'borderLeftStyle' | 'borderLeftWidth'>;

export function borderLeft(width: BorderWidthInput): BorderLeftStyle;
export function borderLeft(width: BorderWidthInput, style: BorderStyleInput): BorderLeftStyle;
export function borderLeft(width: BorderWidthInput, style: BorderStyleInput, color: BorderColorInput): BorderLeftStyle;

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
export function borderLeft(...values: [BorderWidthInput, BorderStyleInput?, BorderColorInput?]): BorderLeftStyle {
  return {
    borderLeftWidth: values[0],
    ...(values[1] && ({ borderLeftStyle: values[1] } as BorderLeftStyle)),
    ...(values[2] && { borderLeftColor: values[2] }),
  };
}
