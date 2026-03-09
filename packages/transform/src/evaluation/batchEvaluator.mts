import type { Program } from 'oxc-parser';

import type { StrictOptions } from './types.mjs';

import type { StyleCall } from '../types.mjs';
import type { AstEvaluatorPlugin } from './types.mjs';
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
  programAst: Program,
  astEvaluationPlugins: AstEvaluatorPlugin[] = [],
): {
  usedVMForEvaluation: boolean;
  evaluationResults: unknown[];
} {
  const evaluationResults: unknown[] = new Array(styleCalls.length);

  // Track calls that need VM evaluation: their original index and argument source code
  const vmCalls: { index: number; argumentCode: string }[] = [];

  // First pass: try static evaluation for all calls
  for (let i = 0; i < styleCalls.length; i++) {
    const styleCall = styleCalls[i];
    const staticResult = astEvaluator(styleCall.argumentNode, programAst, astEvaluationPlugins);

    if (staticResult.confident) {
      evaluationResults[i] = staticResult.value;
      continue;
    }

    // Mark for VM evaluation
    vmCalls.push({ index: i, argumentCode: styleCall.argumentCode });
  }

  if (vmCalls.length === 0) {
    return {
      usedVMForEvaluation: false,
      evaluationResults,
    };
  }

  // Second pass: batch VM evaluation for complex expressions
  const expressionCode = vmCalls.map(c => c.argumentCode).join(',');
  const vmResult = vmEvaluator(sourceCode, filename, expressionCode, babelOptions, evaluationRules);

  if (!vmResult.confident) {
    if (vmResult.error) {
      throw vmResult.error;
    } else {
      throw new Error('Evaluation of a code fragment failed, this is a bug, please report it');
    }
  }

  // Map VM results back to correct indices
  const vmValues = vmResult.value as unknown[];

  for (let i = 0; i < vmCalls.length; i++) {
    evaluationResults[vmCalls[i].index] = vmValues[i];
  }

  return {
    usedVMForEvaluation: true,
    evaluationResults,
  };
}
