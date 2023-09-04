import * as path from 'path';
import { TSESLint } from '@typescript-eslint/utils';
import rule from './css-lint';

const ruleTesterInstance = new TSESLint.RuleTester({
  parser: path.resolve('./node_modules/@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
});
ruleTesterInstance.run('css-lint', rule, {
  valid: [],
  invalid: [
    {
      name: 'test',
      errors: [{ messageId: 'foo' }],
      code: `
      import { makeStyles } from '@griffel/react'
      const useStyles = makeStyles({
        root: {
          '& div': {
            color: 'red',
            backgroundColor: 'blue',
          }
        }
      })
      `,
      filename: './useComponentStyles.styles.ts',
    },
  ],
});
