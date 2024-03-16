import type { GriffelStyle } from '@griffel/style-types';
import type { InsetInput } from './types';

type InsetStyle = Pick<GriffelStyle, 'top' | 'right' | 'bottom' | 'left'> | Pick<GriffelStyle, 'inset'>;

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
 */
export function inset(...values: InsetInput[]): InsetStyle {
  const [firstValue, secondValue = firstValue, thirdValue = firstValue, fourthValue = secondValue] = values;

  if (values.some(value => Array.isArray(value))) {
    return {
      top: firstValue,
      right: secondValue,
      bottom: thirdValue,
      left: fourthValue,
    };
  }

  if (firstValue === secondValue && firstValue === thirdValue && firstValue === fourthValue) {
    return { inset: firstValue };
  }

  if (firstValue === thirdValue && secondValue === fourthValue) {
    return { inset: `${firstValue} ${secondValue}` };
  }

  if (secondValue === fourthValue) {
    return { inset: `${firstValue} ${secondValue} ${thirdValue}` };
  }

  return { inset: `${firstValue} ${secondValue} ${thirdValue} ${fourthValue}` };
}
