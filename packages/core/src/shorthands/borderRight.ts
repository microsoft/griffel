import type { GriffelStyle } from '@griffel/style-types';

import type { BorderColorInput, BorderStyleInput, BorderWidthInput } from './types';
import { isBorderStyle } from './utils';

type BorderRightStyle = Pick<GriffelStyle, 'borderRightWidth' | 'borderRightStyle' | 'borderRightColor'>;

/** @deprecated Use `{ borderRight: '2px' }` instead as Griffel supports CSS shorthands now */
export function borderRight(width: BorderWidthInput): BorderRightStyle;
/** @deprecated Use `{ borderRight: 'solid' }` instead as Griffel supports CSS shorthands now */
export function borderRight(style: BorderStyleInput): BorderRightStyle;
/** @deprecated Use `{ borderRight: '2px solid' }` instead as Griffel supports CSS shorthands now */
export function borderRight(width: BorderWidthInput, style: BorderStyleInput): BorderRightStyle;
/** @deprecated Use `{ borderRight: 'solid 2px' }` instead as Griffel supports CSS shorthands now */
export function borderRight(style: BorderStyleInput, width: BorderWidthInput): BorderRightStyle;
/** @deprecated Use `{ borderRight: '2px solid red' }` instead as Griffel supports CSS shorthands now */
export function borderRight(
  width: BorderWidthInput,
  style: BorderStyleInput,
  color: BorderColorInput,
): BorderRightStyle;
/** @deprecated Use `{ borderRight: 'solid 2px red' }` instead as Griffel supports CSS shorthands now */
export function borderRight(
  style: BorderStyleInput,
  width: BorderWidthInput,
  color: BorderColorInput,
): BorderRightStyle;

/**
 * A function that implements expansion for "border-right", it's simplified - check usage examples.
 *
 * @example
 *  borderRight('2px')
 *  borderRight('solid')
 *  borderRight('2px', 'solid')
 *  borderRight('solid', '2px')
 *  borderRight('2px', 'solid', 'red')
 *  borderRight('solid', '2px', 'red')
 *
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/border-right
 *
 * @deprecated Just use `{ borderRight: '2px solid red' }` instead as Griffel supports CSS shorthands now
 */
export function borderRight(
  ...values: [BorderWidthInput | BorderStyleInput, (BorderWidthInput | BorderStyleInput)?, BorderColorInput?]
): BorderRightStyle {
  if (isBorderStyle(values[0])) {
    return {
      borderRightStyle: values[0],
      ...(values[1] && { borderRightWidth: values[1] }),
      ...(values[2] && { borderRightColor: values[2] }),
    };
  }

  return {
    borderRightWidth: values[0],
    ...(values[1] && ({ borderRightStyle: values[1] } as BorderRightStyle)),
    ...(values[2] && { borderRightColor: values[2] }),
  };
}
