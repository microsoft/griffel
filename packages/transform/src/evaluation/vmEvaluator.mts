import { Module, type StrictOptions } from '@linaria/babel-preset';
import type { EvaluationResult } from './types.mjs';

function isError(e: unknown): e is Error {
  return Object.prototype.toString.call(e) === '[object Error]';
}

export function vmEvaluator(
  sourceCode: string,
  filename: string,
  expressionCode: string,

  babelOptions: NonNullable<StrictOptions['babelOptions']>,
  evaluationRules: NonNullable<StrictOptions['rules']>,
): EvaluationResult {
  // Create a simple wrapper program for evaluation
  const codeForEvaluation = `
${sourceCode}

const __mkPreval = (() => {
  try {
    return ([${expressionCode}]);
  } catch (e) {
    return e;
  }
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { __mkPreval };
}
`;

  try {
    const options: StrictOptions = {
      displayName: false,
      evaluate: true,
      rules: evaluationRules,
      babelOptions: {
        ...babelOptions,
        configFile: false,
        babelrc: false,
      },
    };

    const mod = new Module(filename, options);
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
