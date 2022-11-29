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
      name: 'named useStyles',
      code: `
import { makeStyles } from '@griffel/react';

export const useStyles = makeStyles({
  root: { backgroundColor: 'red' },
});
`,
    },
    {
      name: 'can be imported from react-components',
      code: `
import { makeStyles } from '@fluentui/react-components';

export const useStyles = makeStyles({
  root: { color: 'red' },
  background: { backgroundColor: 'red' },
});
`,
    },
  ],

  invalid: [
    {
      name: 'Named with get',
      code: `
import { makeStyles } from '@griffel/react';

export const getStyles = makeStyles({
  root: { backgroundColor: 'red' },
});
`,
      errors: [{ messageId: 'invalidMakeStylesHookNameFound' }],
    },
    {
      name: 'Name is only styles',
      code: `
import { makeStyles } from '@griffel/react';

export const styles = makeStyles({
  root: {
    ':hover': { backgroundColor: 'red' }
  },
});
`,
      errors: [{ messageId: 'invalidMakeStylesHookNameFound' }],
    },
  ],
});
