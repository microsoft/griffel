import { RuleTester } from '@typescript-eslint/rule-tester';
import * as tsParser from '@typescript-eslint/parser';

import { pseudoElementNamingRule, RULE_NAME } from './pseudo-element-naming';

const ruleTester = new RuleTester({
  languageOptions: { parser: tsParser, ecmaVersion: 2018, sourceType: 'module' },
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
    import { makeResetStyles, makeStyles } from '@griffel/react';

    export const useStyles = makeStyles({
      root: { '::before': { backgroundColor: 'red' } },
    });

    export const useStyles = makeResetStyles({
      '::before': { backgroundColor: 'red' }
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
      name: 'Invalid Pseudo Element in makeResetStyles',
      code: `
    import { makeResetStyles } from '@griffel/react';
    export const useStyles = makeResetStyles({
      ':before': { backgroundColor: 'red' },
    });
    `,
      output: `
    import { makeResetStyles } from '@griffel/react';
    export const useStyles = makeResetStyles({
      '::before': { backgroundColor: 'red' },
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
