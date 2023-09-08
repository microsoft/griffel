import * as path from 'path';
import { TSESLint } from '@typescript-eslint/utils';
import { cssLintRule } from './css-lint';

const stylelintConfigFile = require.resolve('./.stylelintrc-test.js');
const ruleTesterInstance = new TSESLint.RuleTester({
  parser: path.resolve('./node_modules/@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
});
ruleTesterInstance.run('css-lint', cssLintRule, {
  valid: [
    {
      options: [{ stylelintConfigFile }],
      name: 'should pass stylelint',
      code: `
      import { makeStyles } from '@griffel/react'
      const useStyles = makeStyles({
        root: {
          ':nth-child(1)': {
            color: 'red',
          }
        }
      })
      `,
      filename: './useComponentStyles.styles.ts',
    },
  ],
  invalid: [
    {
      options: [{ stylelintConfigFile }],
      name: 'should fail stylelint (reset)',
      errors: [
        {
          messageId: 'stylelint',
          data: { stylelint: 'Unexpected unmatchable An+B selector ":nth-child" (selector-anb-no-unmatchable)' },
        },
      ],
      code: `
      import { makeResetStyles } from '@griffel/react'
      const useResetStyles = makeResetStyles({
        ':nth-child(0)': {
          color: 'red',
          backgroundColor: 'green',
        }
      })
      `,
      filename: './useComponentStyles.styles.ts',
    },
    {
      options: [{ stylelintConfigFile }],
      name: 'should fail stylelint',
      errors: [
        {
          messageId: 'stylelint',
          data: { stylelint: 'Unexpected unmatchable An+B selector ":nth-child" (selector-anb-no-unmatchable)' },
        },
      ],
      code: `
      import { makeStyles } from '@griffel/react'
      const useStyles = makeStyles({
        root: {
          ':nth-child(0)': {
            color: 'red',
          }
        }
      })
      `,
      filename: './useComponentStyles.styles.ts',
    },
    {
      options: [{ stylelintConfigFile: stylelintConfigFile }],
      name: 'should only warn once per error',
      errors: [
        {
          messageId: 'stylelint',
          data: { stylelint: 'Unexpected unmatchable An+B selector ":nth-child" (selector-anb-no-unmatchable)' },
        },
      ],
      code: `
      import { makeStyles } from '@griffel/react'
      const useStyles = makeStyles({
        root: {
          ':nth-child(0)': {
            color: 'red',
            backgroundColor: 'green',
          }
        }
      })
      `,
      filename: './useComponentStyles.styles.ts',
    },
  ],
});
