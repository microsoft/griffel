import { TSESLint } from '@typescript-eslint/utils';
import * as path from 'path';

import { noShorthandsRule, RULE_NAME } from './no-shorthands';

const ruleTester = new TSESLint.RuleTester({
  parser: path.resolve('./node_modules/@typescript-eslint/parser/dist'),
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
    {
      name: 'CSS shorthands can be used in makeResetStyles and makeStaticStyles',
      code: `
import { makeResetStyles, makeStaticStyles } from '@griffel/react';

export const useClass = makeResetStyles({
  background: 'red'
});

export const useStyles = makeStaticStyles({
  body: { background: 'red' }
})
`,
    },
  ],

  invalid: [
    {
      name: 'CSS shorthand or root level',
      code: `
import { makeStyles } from '@griffel/react';

export const useStyles = makeStyles({
  root: { borderWidth: '2px' },
});
`,
      output: `
import { makeStyles } from '@griffel/react';

export const useStyles = makeStyles({
  root: { ...shorthands.borderWidth('2px') },
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
    ':hover': { borderWidth: '2px' }
  },
});
`,
      output: `
import { makeStyles } from '@griffel/react';

export const useStyles = makeStyles({
  root: {
    ':hover': { ...shorthands.borderWidth('2px') }
  },
});
`,
      errors: [{ messageId: 'shorthandFound' }],
    },
    {
      name: 'borderColor shorthand',
      code: `
import { makeStyles } from '@griffel/react';

export const useStyles = makeStyles({
  root: { borderColor: 'rgb(0 0 0)' },
});
`,
      output: `
import { makeStyles } from '@griffel/react';

export const useStyles = makeStyles({
  root: { ...shorthands.borderColor('rgb(0 0 0)') },
});
`,
      errors: [{ messageId: 'shorthandFound' }],
    },
    {
      name: 'borderColor shorthand with template string',
      code: `
import { makeStyles } from '@griffel/react';

export const useStyles = makeStyles({
  root: { borderColor: ${'`${tokens.colorNeutralStroke1}`'} },
});
`,
      output: `
import { makeStyles } from '@griffel/react';

export const useStyles = makeStyles({
  root: { ...shorthands.borderColor(${'`${tokens.colorNeutralStroke1}`'}) },
});
`,
      errors: [{ messageId: 'shorthandFound' }],
    },
  ],
});
