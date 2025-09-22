import type { StrictOptions } from '@linaria/babel-preset';

import type { StyleCall } from '../types.mjs';
import { astEvaluator } from './astEvaluator.mjs';
import { vmEvaluator } from './vmEvaluator.mjs';

/**
 * Batch evaluates all style calls in a file for better performance.
 * Uses static evaluation first, then falls back to VM evaluation for complex expressions.
 * Optimizes VM evaluation by sharing module loading and parsing overhead.
 */
export function batchEvaluator(
  sourceCode: string,
  filename: string,
  styleCalls: StyleCall[],
  babelOptions: NonNullable<StrictOptions['babelOptions']>,
  evaluationRules: NonNullable<StrictOptions['rules']>,
): {
  usedVMForEvaluation: boolean;
  evaluationResults: unknown[];
} {
  const evaluationResults: unknown[] = new Array(styleCalls.length);

  const argumentsCode = new Array(styleCalls.length).fill(null);
  let vmEvaluationNeeded = false;

  // First pass: try static evaluation for all calls
  for (let i = 0; i < styleCalls.length; i++) {
    const styleCall = styleCalls[i];
    const staticResult = astEvaluator(styleCall.argumentNode);

    if (staticResult.confident) {
      evaluationResults[i] = staticResult.value;
      continue;
    }

    // Mark for VM evaluation
    vmEvaluationNeeded = true;
    argumentsCode[i] = styleCall.argumentCode;
  }

  if (!vmEvaluationNeeded) {
    return {
      usedVMForEvaluation: false,
      evaluationResults,
    };
  }

  // Second pass: batch VM evaluation for complex expressions
  const vmResult = vmEvaluator(sourceCode, filename, argumentsCode.join(','), babelOptions, evaluationRules);

  if (!vmResult.confident) {
    if (vmResult.error) {
      throw vmResult.error;
    } else {
      throw new Error('Evaluation of a code fragment failed, this is a bug, please report it');
    }
  }

  const vmValues = vmResult.value as unknown[];

  for (let i = 0; i < vmValues.length; i++) {
    if (vmValues[i] === null) {
      // This was already evaluated statically
      continue;
    }

    evaluationResults[i] = vmValues[i];
  }

  return {
    usedVMForEvaluation: true,
    evaluationResults,
  };
}
