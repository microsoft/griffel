import type { GriffelStyle } from '@griffel/style-types';

import { generateStyles } from './generateStyles';
import type { PaddingInput } from './types';
import { validateArguments } from './utils';

type PaddingStyle = Pick<GriffelStyle, 'paddingTop' | 'paddingRight' | 'paddingBottom' | 'paddingLeft'>;

export function padding(all: PaddingInput): PaddingStyle;
export function padding(vertical: PaddingInput, horizontal: PaddingInput): PaddingStyle;
export function padding(top: PaddingInput, horizontal: PaddingInput, bottom: PaddingInput): PaddingStyle;
export function padding(top: PaddingInput, right: PaddingInput, bottom: PaddingInput, left: PaddingInput): PaddingStyle;

/**
 * A function that implements CSS spec conformant expansion for "padding"
 *
 * @example
 *   padding('10px')
 *   padding('10px', '5px')
 *   padding('2px', '4px', '8px')
 *   padding('1px', 0, '3px', '4px')
 *
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/padding
 */
export function padding(...values: PaddingInput[]) {
  validateArguments('padding', arguments);

  return generateStyles<PaddingStyle>('padding', '', ...values);
}
