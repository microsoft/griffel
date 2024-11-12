import type { GriffelStyle } from '@griffel/style-types';

import type { BorderColorInput, BorderStyleInput, BorderWidthInput } from './types';
import { isBorderStyle } from './utils';

type BorderLeftStyle = Pick<GriffelStyle, 'borderLeftColor' | 'borderLeftStyle' | 'borderLeftWidth'>;

/** @deprecated Use `{ borderLeft: '2px' }` instead as Griffel supports CSS shorthands now */
export function borderLeft(width: BorderWidthInput): BorderLeftStyle;
/** @deprecated Use `{ borderLeft: 'solid' }` instead as Griffel supports CSS shorthands now */
export function borderLeft(style: BorderStyleInput): BorderLeftStyle;
/** @deprecated Use `{ borderLeft: '2px solid' }` instead as Griffel supports CSS shorthands now */
export function borderLeft(width: BorderWidthInput, style: BorderStyleInput): BorderLeftStyle;
/** @deprecated Use `{ borderLeft: 'solid 2px' }` instead as Griffel supports CSS shorthands now */
export function borderLeft(style: BorderStyleInput, width: BorderWidthInput): BorderLeftStyle;
/** @deprecated Use `{ borderLeft: '2px solid red' }` instead as Griffel supports CSS shorthands now */
export function borderLeft(width: BorderWidthInput, style: BorderStyleInput, color: BorderColorInput): BorderLeftStyle;
/** @deprecated Use `{ borderLeft: 'solid 2px red' }` instead as Griffel supports CSS shorthands now */
export function borderLeft(style: BorderStyleInput, width: BorderWidthInput, color: BorderColorInput): BorderLeftStyle;

/**
 * A function that implements expansion for "border-left", it's simplified - check usage examples.
 *
 * @example
 *  borderLeft('2px')
 *  borderLeft('solid')
 *  borderLeft('2px', 'solid')
 *  borderLeft('solid', '2px')
 *  borderLeft('2px', 'solid', 'red')
 *  borderLeft('solid', '2px', 'red')
 *
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/border-left
 *
 * @deprecated Just use `{ borderLeft: '2px solid red' }` instead as Griffel supports CSS shorthands now
 */
export function borderLeft(
  ...values: [BorderWidthInput | BorderStyleInput, (BorderWidthInput | BorderStyleInput)?, BorderColorInput?]
): BorderLeftStyle {
  if (isBorderStyle(values[0])) {
    return {
      borderLeftStyle: values[0],
      ...(values[1] && ({ borderLeftWidth: values[1] } as BorderLeftStyle)),
      ...(values[2] && { borderLeftColor: values[2] }),
    };
  }

  return {
    borderLeftWidth: values[0],
    ...(values[1] && ({ borderLeftStyle: values[1] } as BorderLeftStyle)),
    ...(values[2] && { borderLeftColor: values[2] }),
  };
}
