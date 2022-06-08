import { TSESLint } from '@typescript-eslint/utils';
import * as path from 'path';

import { noShorthandsRule, RULE_NAME } from './no-shorthands';

const ruleTester = new TSESLint.RuleTester({
  parser: path.resolve('./node_modules/@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
});

ruleTester.run(RULE_NAME, noShorthandsRule, {
  valid: [
    {
      name: 'without CSS shorthands',
      code: `
import { makeStyles } from '@griffel/react';

export const useStyles = makeStyles({
  root: { backgroundColor: 'red' },
});
`,
    },
    {
      name: 'CSS shorthands can be used as slot names',
      code: `
import { makeStyles } from '@griffel/react';

export const useStyles = makeStyles({
  background: { backgroundColor: 'red' },
});
`,
    },
  ],

  invalid: [
    {
      name: 'CSS shorthand or root level',
      code: `
import { makeStyles } from '@griffel/react';

export const useStyles = makeStyles({
  root: { background: 'red' },
});
`,
      errors: [{ messageId: 'shorthandFound' }],
    },
    {
      name: 'CSS shorthand in a selector',
      code: `
import { makeStyles } from '@griffel/react';

export const useStyles = makeStyles({
  root: {
    ':hover': { background: 'red' }
  },
});
`,
      errors: [{ messageId: 'shorthandFound' }],
    },
  ],
});
