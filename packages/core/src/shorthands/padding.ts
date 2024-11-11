import type { GriffelStyle } from '@griffel/style-types';

import { generateStyles } from './generateStyles';
import type { PaddingInput } from './types';

type PaddingStyle = Pick<GriffelStyle, 'paddingTop' | 'paddingRight' | 'paddingBottom' | 'paddingLeft'>;

/** @deprecated Use `{ padding: '10px' }` instead as Griffel supports CSS shorthands now */
export function padding(all: PaddingInput): PaddingStyle;
/** @deprecated Use `{ padding: '10px 5px' }` instead as Griffel supports CSS shorthands now */
export function padding(vertical: PaddingInput, horizontal: PaddingInput): PaddingStyle;
/** @deprecated Use `{ padding: '10px 5px 8px' }` instead as Griffel supports CSS shorthands now */
export function padding(top: PaddingInput, horizontal: PaddingInput, bottom: PaddingInput): PaddingStyle;
/** @deprecated Use `{ padding: '10px 5px 8px 4px' }` instead as Griffel supports CSS shorthands now */
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
 *
 * @deprecated Just use `{ padding: '10px 5px 8px 4px' }` instead as Griffel supports CSS shorthands now
 */
export function padding(...values: PaddingInput[]) {
  return generateStyles<PaddingStyle>('padding', '', ...values);
}
