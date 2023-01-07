// @ts-check

/** @type {import("@linaria/utils").Evaluator} */
const sampleEvaluator = (babelOptions, ast) => {
  // Evaluators transform input code to something that will be evaluated by Node
  // later. Linaria expects that results will be available as
  // "exports.__linariaPreval", this evaluator mocks it
  const result = `
    exports.__linariaPreval = {
      _exp: () => ({
        root: { color: 'blue' }
      })
    };
  `;

  return [ast, result, null];
};

module.exports.default = sampleEvaluator;
