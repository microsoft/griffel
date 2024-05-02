import type { GriffelStyle } from '@griffel/style-types';

import type { BorderColorInput, BorderStyleInput, BorderWidthInput } from './types';
import { isBorderStyle } from './utils';

type BorderBottomStyle = Pick<GriffelStyle, 'borderBottomColor' | 'borderBottomStyle' | 'borderBottomWidth'>;

export function borderBottom(width: BorderWidthInput): BorderBottomStyle;
export function borderBottom(style: BorderStyleInput): BorderBottomStyle;
export function borderBottom(width: BorderWidthInput, style: BorderStyleInput): BorderBottomStyle;
export function borderBottom(style: BorderStyleInput, width: BorderWidthInput): BorderBottomStyle;
export function borderBottom(
  width: BorderWidthInput,
  style: BorderStyleInput,
  color: BorderColorInput,
): BorderBottomStyle;
export function borderBottom(
  style: BorderStyleInput,
  width: BorderWidthInput,
  color: BorderColorInput,
): BorderBottomStyle;

/**
 * A function that implements expansion for "border-Bottom", it's simplified - check usage examples.
 *
 * @example
 *  borderBottom('2px')
 *  borderBottom('solid')
 *  borderBottom('2px', 'solid')
 *  borderBottom('solid', '2px')
 *  borderBottom('2px', 'solid', 'red')
 *  borderBottom('solid', '2px', 'red')
 *
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/border-bottom
 *
 * @deprecated Just use `{ borderBottom: '2px solid red' }` instead as Griffel supports CSS shorthands now
 */
export function borderBottom(
  ...values: [BorderWidthInput | BorderStyleInput, (BorderWidthInput | BorderStyleInput)?, BorderColorInput?]
): BorderBottomStyle {
  if (isBorderStyle(values[0])) {
    return {
      borderBottomStyle: values[0],
      ...(values[1] && ({ borderBottomWidth: values[1] } as BorderBottomStyle)),
      ...(values[2] && { borderBottomColor: values[2] }),
    };
  }

  return {
    borderBottomWidth: values[0],
    ...(values[1] && ({ borderBottomStyle: values[1] } as BorderBottomStyle)),
    ...(values[2] && { borderBottomColor: values[2] }),
  };
}
