import { TSESLint } from '@typescript-eslint/utils';
import * as path from 'path';

import { pseudoElementNamingRule, RULE_NAME } from './pseudo-element-naming';

const ruleTester = new TSESLint.RuleTester({
  parser: path.resolve('./node_modules/@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
});

ruleTester.run(RULE_NAME, pseudoElementNamingRule, {
  valid: [
    {
      name: 'without Pseudo Element',
      code: `
import { makeStyles } from '@griffel/react';

export const useStyles = makeStyles({
  root: { backgroundColor: 'red' },
});
`,
    },
    {
      name: 'with Valid Pseudo Element',
      code: `
    import { makeStyles } from '@griffel/react';

    export const useStyles = makeStyles({
      root: { '::before': { backgroundColor: 'red' } },
    });
    `,
    },
    {
      name: 'Invalid Pseudo Elements can be used as slot names',
      code: `
    import { makeStyles } from '@griffel/react';

    export const useStyles = makeStyles({
      ':before': { backgroundColor: 'red' },
    });
    `,
    },
  ],

  invalid: [
    {
      name: 'Invalid Pseudo Element',
      code: `
    import { makeStyles } from '@griffel/react';
    export const useStyles = makeStyles({
      root: { ':before': { backgroundColor: 'red' } },
    });
    `,
      output: `
    import { makeStyles } from '@griffel/react';
    export const useStyles = makeStyles({
      root: { '::before': { backgroundColor: 'red' } },
    });
    `,
      errors: [{ messageId: 'invalidPseudoElementNameFound' }],
    },
    {
      name: 'Invalid Pseudo Element in a selector',
      code: `
    import { makeStyles } from '@griffel/react';
    export const useStyles = makeStyles({
      root: {
        ':hover': { ':before': { backgroundColor: 'red' } }
      },
    });
    `,
      output: `
    import { makeStyles } from '@griffel/react';
    export const useStyles = makeStyles({
      root: {
        ':hover': { '::before': { backgroundColor: 'red' } }
      },
    });
    `,
      errors: [{ messageId: 'invalidPseudoElementNameFound' }],
    },
  ],
});
