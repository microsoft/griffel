import { stylelintSync } from './stylelint-sync';

const stylelintcConfigFile = require.resolve('./.stylelintrc.js');

describe('stylelintSync', () => {
  it('should by sync', () => {
    const { stylelintErrors } = stylelintSync('.foo{color: red;}', stylelintcConfigFile);
    expect(stylelintErrors).toEqual([]);
  });

  it('should report crash errors', () => {
    const { error } = stylelintSync('.foo{color: red;}');
    expect(error).toContain(
      `Error running stylelint, please report to Griffel maintainers: No configuration provided for`,
    );
  });

  it('should return stylelint errors', () => {
    const { stylelintErrors } = stylelintSync('.foo:nth-child(0){color: red;}', stylelintcConfigFile);
    expect(stylelintErrors).toMatchInlineSnapshot(`
      Array [
        Object {
          "column": 6,
          "endColumn": 19,
          "endLine": 1,
          "line": 1,
          "rule": "selector-anb-no-unmatchable",
          "severity": "error",
          "text": "Unexpected unmatchable An+B selector \\":nth-child\\" (selector-anb-no-unmatchable)",
        },
      ]
    `);
  });
});
