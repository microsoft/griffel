import * as stylelint from 'stylelint';
import griffelStylelintConfig from './index';
import { createSyntax } from '@griffel/postcss-syntax';

describe('stylelint', () => {
  it('should lint makeStyles with standard config', async () => {
    expect.assertions(1);
    const config = {
      ...griffelStylelintConfig,
      rules: {
        'selector-anb-no-unmatchable': [true],
      },
    };

    const code = `
import { makeStyles } from '@griffel/react';

const useStyles = makeStyles({
  root: {
    ':nth-child(0)': {
      color: 'red',
    }
  }
})
`;

    const { results } = await stylelint.lint({ code, config });
    const warnings = results.map(result => result.warnings).flat();
    expect(warnings).toMatchInlineSnapshot(`
      Array [
        Object {
          "column": 11,
          "endColumn": 24,
          "endLine": 5,
          "line": 5,
          "rule": "selector-anb-no-unmatchable",
          "severity": "error",
          "text": "Unexpected unmatchable An+B selector \\":nth-child\\" (selector-anb-no-unmatchable)",
        },
      ]
    `);
  });

  it('should lint makeStyles with different module source', async () => {
    expect.assertions(1);
    const config = {
      customSyntax: createSyntax({ modules: [{ moduleSource: '@foo/foo', importName: 'foo' }] }),
      rules: {
        'selector-anb-no-unmatchable': [true],
      },
    };

    const code = `
import { foo } from '@foo/foo';

const useStyles = foo({
  root: {
    ':nth-child(0)': {
      color: 'red',
    }
  }
})
`;

    const { results } = await stylelint.lint({ code, config });
    const warnings = results.map(result => result.warnings).flat();
    expect(warnings).toMatchInlineSnapshot(`
      Array [
        Object {
          "column": 11,
          "endColumn": 24,
          "endLine": 5,
          "line": 5,
          "rule": "selector-anb-no-unmatchable",
          "severity": "error",
          "text": "Unexpected unmatchable An+B selector \\":nth-child\\" (selector-anb-no-unmatchable)",
        },
      ]
    `);
  });
});
