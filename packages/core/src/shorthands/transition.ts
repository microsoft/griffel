import type { GriffelStyle } from '@griffel/style-types';

import {
  TransitionDelayInput,
  TransitionDurationInput,
  TransitionPropertyInput,
  TransitionTimingFunctionInput,
  TransitionGlobalInput,
} from './types';
import { validateArguments } from './utils';

type TransitionInputs = [
  TransitionPropertyInput,
  TransitionDurationInput?,
  TransitionDelayInput?,
  TransitionTimingFunctionInput?,
];

type TransitionStyle = Pick<
  GriffelStyle,
  'transitionProperty' | 'transitionDelay' | 'transitionDuration' | 'transitionTimingFunction'
>;

export function transition(globalValue: TransitionGlobalInput): TransitionStyle;
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
  ...values: [TransitionGlobalInput] | TransitionInputs | [TransitionInputs[]]
): TransitionStyle {
  validateArguments('transition', arguments);

  if (isTransitionGlobalInputs(values)) {
    return {
      transitionDelay: values[0],
      transitionDuration: values[0],
      transitionProperty: values[0],
      transitionTimingFunction: values[0],
    };
  }
  const transitionInputs = normalizeTransitionInputs(values);
  return transitionInputs.reduce<TransitionStyle>(
    (acc, [property, duration = '0s', delay = '0s', timingFunction = 'ease'], index) => {
      if (index === 0) {
        acc.transitionProperty = property;
        acc.transitionDuration = duration;
        acc.transitionDelay = delay;
        acc.transitionTimingFunction = timingFunction;
      } else {
        acc.transitionProperty += `, ${property}`;
        acc.transitionDuration += `, ${duration}`;
        acc.transitionDelay += `, ${delay}`;
        acc.transitionTimingFunction += `, ${timingFunction}`;
      }
      return acc;
    },
    {},
  );
}

const transitionGlobalInputs: TransitionGlobalInput[] = ['-moz-initial', 'inherit', 'initial', 'revert', 'unset'];
function isTransitionGlobalInputs(
  values: [TransitionGlobalInput] | TransitionInputs | [TransitionInputs[]],
): values is [TransitionGlobalInput] {
  return values.length === 1 && transitionGlobalInputs.includes(values[0] as TransitionGlobalInput);
}

function normalizeTransitionInputs(transitionInputs: TransitionInputs | [TransitionInputs[]]): TransitionInputs[] {
  if (transitionInputs.length === 1 && Array.isArray(transitionInputs[0])) {
    return transitionInputs[0];
  }
  return [transitionInputs as TransitionInputs];
}
