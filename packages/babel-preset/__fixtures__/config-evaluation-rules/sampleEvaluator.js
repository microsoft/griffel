// @ts-check

/** @type {import("@linaria/utils").Evaluator} */
const sampleEvaluator = () => {
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

  return [null, result, null];
};

module.exports.default = sampleEvaluator;
