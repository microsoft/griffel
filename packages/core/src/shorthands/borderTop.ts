import type { GriffelStyle } from '@griffel/style-types';

import { BorderColorInput, BorderStyleInput, BorderWidthInput } from './types';
import { validateArguments } from './utils';

type BorderTopStyle = Pick<GriffelStyle, 'borderTopWidth' | 'borderTopStyle' | 'borderTopColor'>;

export function borderTop(width: BorderWidthInput): BorderTopStyle;
export function borderTop(width: BorderWidthInput, style: BorderStyleInput): BorderTopStyle;
export function borderTop(width: BorderWidthInput, style: BorderStyleInput, color: BorderColorInput): BorderTopStyle;

/**
 * A function that implements expansion for "border-top", it's simplified - check usage examples.
 *
 * @example
 *  borderTop('2px')
 *  borderTop('2px', 'solid')
 *  borderTop('2px', 'solid', 'red')
 *
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/border-top
 */
export function borderTop(...values: [BorderWidthInput, BorderStyleInput?, BorderColorInput?]): BorderTopStyle {
  validateArguments('borderTop', arguments);

  return {
    borderTopWidth: values[0],
    ...(values[1] && ({ borderTopStyle: values[1] } as BorderTopStyle)),
    ...(values[2] && { borderTopColor: values[2] }),
  };
}
