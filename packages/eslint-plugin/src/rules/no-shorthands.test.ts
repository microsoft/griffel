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
    {
      name: 'border shorthand',
      code: `
import { makeStyles } from '@griffel/react';

export const useStyles = makeStyles({
  root: { border: '1px solid rgb(0 0 0)' },
  icon: { borderLeft: '1px solid' },
});
`,
      output: `
import { makeStyles } from '@griffel/react';

export const useStyles = makeStyles({
  root: { ...shorthands.border('1px', 'solid', 'rgb(0 0 0)') },
  icon: { ...shorthands.borderLeft('1px', 'solid') },
});
`,
      errors: [{ messageId: 'shorthandFound' }, { messageId: 'shorthandFound' }],
    },
    {
      name: 'flex shorthand',
      code: `
import { makeStyles } from '@griffel/react';

export const useStyles = makeStyles({
  root: { flex: '1 2 30px' },
  icon: { flex: 0 },
});
`,
      output: `
import { makeStyles } from '@griffel/react';

export const useStyles = makeStyles({
  root: { ...shorthands.flex('1', '2', '30px') },
  icon: { ...shorthands.flex('0') },
});
`,
      errors: [{ messageId: 'shorthandFound' }, { messageId: 'shorthandFound' }],
    },
    {
      name: 'margin shorthand',
      code: `
import { makeStyles } from '@griffel/react';

export const useStyles = makeStyles({
  root: { margin: '1em var(--margin-x) 30px' },
  icon: { margin: 20 },
});
`,
      output: `
import { makeStyles } from '@griffel/react';

export const useStyles = makeStyles({
  root: { ...shorthands.margin('1em', 'var(--margin-x)', '30px') },
  icon: { ...shorthands.margin('20px') },
});
`,
      errors: [{ messageId: 'shorthandFound' }, { messageId: 'shorthandFound' }],
    },
    {
      name: 'grid-area shorthand',
      code: `
import { makeStyles } from '@griffel/react';

export const useStyles = makeStyles({
  root: { gridArea: 'box' },
  icon: { gridArea: '1 icon / span 2' },
});
`,
      output: `
import { makeStyles } from '@griffel/react';

export const useStyles = makeStyles({
  root: { ...shorthands.gridArea('box') },
  icon: { ...shorthands.gridArea('1 icon', 'span 2') },
});
`,
      errors: [{ messageId: 'shorthandFound' }, { messageId: 'shorthandFound' }],
    },
  ],
});
