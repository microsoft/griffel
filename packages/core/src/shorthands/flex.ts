import * as CSS from 'csstype';
import type { GriffelStylesStrictCSSObject, ValueOrArray } from '../types';
import { FlexInput } from './types';

type FlexStyle = Pick<GriffelStylesStrictCSSObject, 'flexGrow' | 'flexShrink' | 'flexBasis'>;

const isUnit = (value: CSS.Property.Flex | undefined) => typeof value === 'string' && /(\d+(\w+|%))/.test(value);

const isUnitless = (value: CSS.Property.Flex | undefined) => typeof value === 'number' && !Number.isNaN(value);

const isInitial = (value: CSS.Property.Flex | undefined) => value === 'initial';

const isAuto = (value: CSS.Property.Flex | undefined) => value === 'auto';

const isNone = (value: CSS.Property.Flex | undefined) => value === 'none';

const widthReservedKeys = ['content', 'fit-content', 'max-content', 'min-content'] as const;
type ReservedKeys = typeof widthReservedKeys[number];
type Width = ReservedKeys | string;
const isWidth = (value: CSS.Property.Flex | undefined) => widthReservedKeys.some(key => value === key) || isUnit(value);

/**
 * generateFlex is the core functionality for expanding a `flex` shortcut into a longhand `flexGrow`, `flexShrink`,
 * and `flexBasis`
 * @param values shortcut to expand
 * @returns FlexStyle longhand
 */
function generateFlex(...values: FlexInput): FlexStyle {
  const isOneValueSyntax = values.length === 1;
  const isTwoValueSyntax = values.length === 2;
  const isThreeValueSyntax = values.length === 3;

  if (isOneValueSyntax) {
    const [firstValue] = values;

    if (isInitial(firstValue)) {
      return {
        flexGrow: 0,
        flexShrink: 1,
        flexBasis: 'auto',
      };
    }

    if (isAuto(firstValue)) {
      return {
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: 'auto',
      };
    }

    if (isNone(firstValue)) {
      return {
        flexGrow: 0,
        flexShrink: 0,
        flexBasis: 'auto',
      };
    }

    if (isUnitless(firstValue)) {
      return {
        flexGrow: firstValue as number,
        flexShrink: 1,
        flexBasis: 0,
      };
    }

    if (isWidth(firstValue)) {
      return {
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: firstValue as Width,
      };
    }
  }

  if (isTwoValueSyntax) {
    const [firstValue, secondValue] = values;

    if (isUnitless(secondValue)) {
      return {
        flexGrow: firstValue,
        flexShrink: secondValue,
        flexBasis: 'auto',
      };
    }

    if (isWidth(secondValue)) {
      return {
        flexGrow: firstValue,
        flexShrink: 1,
        flexBasis: secondValue as Width,
      };
    }
  }

  if (isThreeValueSyntax) {
    const [firstValue, secondValue, thirdValue] = values;
    if (isUnitless(firstValue) && isUnitless(secondValue) && (isAuto(thirdValue) || isWidth(thirdValue))) {
      return {
        flexGrow: firstValue,
        flexShrink: secondValue,
        flexBasis: thirdValue as Width,
      };
    }
  }

  return {
    flexGrow: 0,
    flexShrink: 1,
    flexBasis: 'auto',
  } as FlexStyle;
}

/**
 * mergeValue assembles an array of fallbacks from unique values.
 * @param to the accumulator
 * @param value to assess
 * @returns Either (1) a singular FlexStyle if all the values were repeated, (2) or an array of FlexStyle fallbacks. The
 * values in the array are not repeated.
 */
const mergeValue = (to: ValueOrArray<CSS.Property.Flex>, value: CSS.Property.Flex): ValueOrArray<CSS.Property.Flex> => {
  if (Array.isArray(to)) {
    return to[to.length - 1] === value ? to : [...to, value];
  } else {
    return to === value ? to : [to, value];
  }
};

/**
 * mergeFallbacks takes an array of FlexStyles and merges then into one object where each key can have an array of
 * fallbacks.
 * @param fallbackArray
 * @returns FlexStyle with fallback arrays if needed.
 */
const mergeFallbacks = (fallbackArray: FlexInput[]) =>
  fallbackArray.reduce((acc, current, arr, index) => {
    const nextFallback = generateFlex(...current);
    for (const key in acc) {
      // @ts-ignore TypeScript fails to correctly type the return value due to ValueOrArray. Tests confirm that this
      // scenario works as expected.
      acc[key as keyof FlexStyle] = mergeValue(acc[key as keyof FlexStyle], nextFallback[key as keyof FlexStyle]);
    }
    return acc;
  }, generateFlex(...fallbackArray[0]));

/**
 * A function that implements CSS spec conformant expansion for "flex"
 *
 * @example
 *   flex('auto')
 *   flex(1, '2.5rem')
 *   flex(0, 0, 'auto')
 *   flex([0, 0, 'auto'], [0, 0, '100vw'])
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/flex
 */
export function flex(...values: ValueOrArray<FlexInput>): FlexStyle {
  const isFallbackValues = Array.isArray(values[0]);

  return !isFallbackValues ? generateFlex(...(values as FlexInput)) : mergeFallbacks(values as FlexInput[]);
}
