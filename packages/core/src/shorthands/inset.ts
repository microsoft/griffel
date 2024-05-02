import type { GriffelStyle } from '@griffel/style-types';
import type { InsetInput } from './types';

type InsetStyle = Pick<GriffelStyle, 'top' | 'right' | 'bottom' | 'left'>;

export function inset(all: InsetInput): InsetStyle;
export function inset(vertical: InsetInput, horizontal: InsetInput): InsetStyle;
export function inset(top: InsetInput, horizontal: InsetInput, bottom: InsetInput): InsetStyle;
export function inset(top: InsetInput, right: InsetInput, bottom: InsetInput, left: InsetInput): InsetStyle;

/**
 * A function that implements CSS spec conformant expansion for "inset"
 *
 * @example
 *   inset('10px')
 *   inset('10px', '5px')
 *   inset('2px', '4px', '8px')
 *   inset('1px', 0, '3px', '4px')
 *
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/inset
 *
 * @deprecated Just use `{ inset: '10px 5px 8px 4px' }` instead as Griffel supports CSS shorthands now
 */
export function inset(...values: InsetInput[]): InsetStyle {
  const [firstValue, secondValue = firstValue, thirdValue = firstValue, fourthValue = secondValue] = values;
  return {
    top: firstValue,
    right: secondValue,
    bottom: thirdValue,
    left: fourthValue,
  };
}
