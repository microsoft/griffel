import { RuleTester } from '@typescript-eslint/rule-tester';
import * as tsParser from '@typescript-eslint/parser';

import { hookNamingRule, RULE_NAME } from './hook-naming';

const ruleTester = new RuleTester({
  languageOptions: { parser: tsParser, ecmaVersion: 2018, sourceType: 'module' },
});

ruleTester.run(RULE_NAME, hookNamingRule, {
  valid: [
    {
      name: 'named useStyles from makeStyles',
      code: `
import { makeStyles } from '@griffel/react';

export const useStyles = makeStyles({
  root: { backgroundColor: 'red' },
});
`,
    },
    {
      name: 'named useStyles from makeStaticStyles',
      code: `
import { makeStaticStyles } from '@griffel/react';

export const useStyles = makeStaticStyles({
  body: { backgroundColor: 'red' },
});
`,
    },
    {
      name: 'named useStyles from makeResetStyles',
      code: `
import { makeResetStyles } from '@griffel/react';

export const useClass = makeResetStyles({
  backgroundColor: 'red'
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
    {
      name: 'named with get from makeStaticStyles',
      code: `
import { makeStaticStyles } from '@griffel/react';

export const getStyles = makeStaticStyles({
  body: { backgroundColor: 'red' },
});
`,
      errors: [{ messageId: 'invalidMakeStylesHookNameFound' }],
    },
    {
      name: 'name is only class from makeResetStyles',
      code: `
import { makeResetStyles } from '@griffel/react';

export const className = makeResetStyles({
  backgroundColor: 'red'
});
`,
      errors: [{ messageId: 'invalidMakeStylesHookNameFound' }],
    },
  ],
});
