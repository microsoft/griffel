import * as CSS from 'csstype';
import type { GriffelStylesStrictCSSObject } from '../types';
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
 * A function that implements CSS spec conformant expansion for "flex".
 *
 * @example
 *   flex('auto')
 *   flex(1, '2.5rem')
 *   flex(0, 0, 'auto')
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/flex
 */
export function flex(...values: FlexInput): FlexStyle {
  const isOneValueSyntax = values.length === 1;
  const isTwoValueSyntax = values.length === 2;
  const isThreeValueSyntax = values.length === 3;

  // One Value Syntax
  if (isOneValueSyntax) {
    const [firstValue] = values;

    if (!Array.isArray(firstValue)) {
      // Single value
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
