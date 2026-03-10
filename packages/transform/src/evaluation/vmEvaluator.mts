import { Module } from './module.mjs';
import type { TransformResolver } from './module.mjs';
import type { EvalRule, EvaluationResult } from './types.mjs';

function isError(e: unknown): e is Error {
  return Object.prototype.toString.call(e) === '[object Error]';
}

export function vmEvaluator(
  sourceCode: string,
  filename: string,
  expressionCode: string,
  evaluationRules: EvalRule[],
  resolveFilename: TransformResolver,
): EvaluationResult {
  // Create a simple wrapper program for evaluation
  const codeForEvaluation = `
${sourceCode}

export const __mkPreval = (() => {
  try {
    return ([${expressionCode}]);
  } catch (e) {
    return e;
  }
})();
`;

  try {
    const mod = new Module(filename, evaluationRules, resolveFilename);
    mod.evaluate(codeForEvaluation, ['__mkPreval']);

    const result = (mod.exports as { __mkPreval: unknown }).__mkPreval;

    if (isError(result)) {
      return { confident: false, error: result };
    }

    return { confident: true, value: result };
  } catch (err) {
    return { confident: false, error: err as Error };
  }
}
