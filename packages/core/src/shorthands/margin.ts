import type { GriffelStyle } from '@griffel/style-types';

import { generateStyles } from './generateStyles';
import type { MarginInput } from './types';

type MarginStyle = Pick<GriffelStyle, 'marginTop' | 'marginRight' | 'marginBottom' | 'marginLeft'>;

/** @deprecated Use `{ margin: '10px 5px 8px 4px' }` instead as Griffel supports CSS shorthands now */
export function margin(all: MarginInput): MarginStyle;
/** @deprecated Use `{ margin: '10px 5px' }` instead as Griffel supports CSS shorthands now */
export function margin(vertical: MarginInput, horizontal: MarginInput): MarginStyle;
/** @deprecated Use `{ margin: '10px 5px 8px' }` instead as Griffel supports CSS shorthands now */
export function margin(top: MarginInput, horizontal: MarginInput, bottom: MarginInput): MarginStyle;
/** @deprecated Use `{ margin: '10px 5px 8px 4px' }` instead as Griffel supports CSS shorthands now */
export function margin(top: MarginInput, right: MarginInput, bottom: MarginInput, left: MarginInput): MarginStyle;

/**
 * A function that implements CSS spec conformant expansion for "margin"
 *
 * @example
 *   margin('10px')
 *   margin('10px', '5px')
 *   margin('2px', '4px', '8px')
 *   margin('1px', 0, '3px', '4px')
 *
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/margin
 *
 * @deprecated Just use `{ margin: '10px 5px 8px 4px' }` instead as Griffel supports CSS shorthands now
 */
export function margin(...values: MarginInput[]): MarginStyle {
  return generateStyles<MarginStyle>('margin', '', ...values);
}
