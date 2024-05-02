import type { GriffelStyle } from '@griffel/style-types';

import type { BorderColorInput, BorderStyleInput, BorderWidthInput } from './types';
import { isBorderStyle } from './utils';

type BorderTopStyle = Pick<GriffelStyle, 'borderTopColor' | 'borderTopStyle' | 'borderTopWidth'>;

export function borderTop(width: BorderWidthInput): BorderTopStyle;
export function borderTop(style: BorderStyleInput): BorderTopStyle;
export function borderTop(width: BorderWidthInput, style: BorderStyleInput): BorderTopStyle;
export function borderTop(style: BorderStyleInput, width: BorderWidthInput): BorderTopStyle;
export function borderTop(width: BorderWidthInput, style: BorderStyleInput, color: BorderColorInput): BorderTopStyle;
export function borderTop(style: BorderStyleInput, width: BorderWidthInput, color: BorderColorInput): BorderTopStyle;

/**
 * A function that implements expansion for "border-Top", it's simplified - check usage examples.
 *
 * @example
 *  borderTop('2px')
 *  borderTop('solid')
 *  borderTop('2px', 'solid')
 *  borderTop('solid', '2px')
 *  borderTop('2px', 'solid', 'red')
 *  borderTop('solid', '2px', 'red')
 *
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/border-top
 *
 * @deprecated Just use `{ borderTop: '2px solid red' }` instead as Griffel supports CSS shorthands now
 */
export function borderTop(
  ...values: [BorderWidthInput | BorderStyleInput, (BorderWidthInput | BorderStyleInput)?, BorderColorInput?]
): BorderTopStyle {
  if (isBorderStyle(values[0])) {
    return {
      borderTopStyle: values[0],
      ...(values[1] && ({ borderTopWidth: values[1] } as BorderTopStyle)),
      ...(values[2] && { borderTopColor: values[2] }),
    };
  }

  return {
    borderTopWidth: values[0],
    ...(values[1] && ({ borderTopStyle: values[1] } as BorderTopStyle)),
    ...(values[2] && { borderTopColor: values[2] }),
  };
}
