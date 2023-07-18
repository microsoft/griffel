import type { GriffelStyle } from '@griffel/style-types';

import { generateStyles } from './generateStyles';
import type { MarginInput } from './types';
import { validateArguments } from './utils';

type MarginStyle = Pick<GriffelStyle, 'marginTop' | 'marginRight' | 'marginBottom' | 'marginLeft'>;

export function margin(all: MarginInput): MarginStyle;
export function margin(vertical: MarginInput, horizontal: MarginInput): MarginStyle;
export function margin(top: MarginInput, horizontal: MarginInput, bottom: MarginInput): MarginStyle;
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
 */
export function margin(...values: MarginInput[]): MarginStyle {
  validateArguments('margin', arguments);

  return generateStyles<MarginStyle>('margin', '', ...values);
}
