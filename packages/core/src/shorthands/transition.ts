import type { GriffelStylesStrictCSSObject } from '../types';
import {
  TransitionDelayInput,
  TransitionDurationInput,
  TransitionPropertyInput,
  TransitionTimingFunctionInput,
  TransitionGlobalnInput,
} from './types';

type TransitionStyle = Pick<
  GriffelStylesStrictCSSObject,
  'transitionProperty' | 'transitionDelay' | 'transitionDuration' | 'transitionTimingFunction'
>;

export function transition(globalValue: TransitionGlobalnInput): TransitionStyle;
export function transition(property: TransitionPropertyInput, duration: TransitionDurationInput): TransitionStyle;
export function transition(
  property: TransitionPropertyInput,
  duration: TransitionDurationInput,
  delay: TransitionDelayInput,
): TransitionStyle;
export function transition(
  property: TransitionPropertyInput,
  duration: TransitionDurationInput,
  delay: TransitionDelayInput,
  easingFunction: TransitionTimingFunctionInput,
): TransitionStyle;
export function transition(values: TransitionInputs[]): TransitionStyle;

/**
 * A function that implements expansion for "transition", it's simplified - check usage examples.
 *
 * @example
 *  transition('inherit')
 *  transition('margin-right', '4s')
 *  transition('margin-right', '4s', '1s')
 *  transition('margin-right', '4s', '1s', 'ease-in')
 *  transition([
 *    ['margin-right', '4s', '1s', 'ease-in'],
 *    ['margin-right', '4s', '1s', 'ease-in'],
 * ])
 *
 * See https://developer.mozilla.org/en-US/docs/Web/CSS/transition
 */
export function transition(
  ...values: [TransitionGlobalnInput] | TransitionInputs | [TransitionInputs[]]
): TransitionStyle {
  if (isTransitionGlobalInputs(values)) {
    return {
      transitionDelay: values[0],
      transitionDuration: values[0],
      transitionProperty: values[0],
      transitionTimingFunction: values[0],
    };
  }
  const [headTransitionInput, ...tailTransitionInputs] = normalizeTransitionInputs(values);
  return tailTransitionInputs.reduce<TransitionStyle>(
    (acc, [property, duration = '0s', delay = '0s', timingFunction = 'ease']) => {
      acc.transitionProperty = `${acc.transitionProperty}, ${property}`;
      acc.transitionDuration = `${acc.transitionDuration}, ${duration}`;
      acc.transitionDelay = `${acc.transitionDelay}, ${delay}`;
      acc.transitionTimingFunction = `${acc.transitionTimingFunction}, ${timingFunction}`;
      return acc;
    },
    {
      transitionProperty: headTransitionInput[0],
      transitionDuration: headTransitionInput[1],
      transitionDelay: headTransitionInput[2],
      transitionTimingFunction: headTransitionInput[3],
    },
  );
}

type TransitionInputs = [
  TransitionPropertyInput,
  TransitionDurationInput?,
  TransitionDelayInput?,
  TransitionTimingFunctionInput?,
];

const transitionGlobalInputs: TransitionGlobalnInput[] = ['-moz-initial', 'inherit', 'initial', 'revert', 'unset'];
function isTransitionGlobalInputs(
  values: [TransitionGlobalnInput] | TransitionInputs | [TransitionInputs[]],
): values is [TransitionGlobalnInput] {
  return values.length === 1 && transitionGlobalInputs.includes(values[0] as TransitionGlobalnInput);
}

function normalizeTransitionInputs(transitionInputs: TransitionInputs | [TransitionInputs[]]): TransitionInputs[] {
  if (transitionInputs.length === 1 && Array.isArray(transitionInputs[0])) {
    return transitionInputs[0];
  }
  return [transitionInputs as TransitionInputs];
}
