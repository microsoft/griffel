import { TSESLint } from '@typescript-eslint/utils';
import * as path from 'path';

import { noInvalidShorthandArgumentRule, RULE_NAME } from './no-invalid-shorthand-argument';

const ruleTester = new TSESLint.RuleTester({
  parser: path.resolve('./node_modules/@typescript-eslint/parser/dist'),
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
});

ruleTester.run(RULE_NAME, noInvalidShorthandArgumentRule, {
  valid: [
    {
      name: 'arguments with no spaces',
      code: `
shorthands.border('2px')
shorthands.borderLeft('1em')
shorthands.borderColor('black')
shorthands.margin('8px')
`,
    },
    {
      name: '!important at the end',
      code: `
shorthands.borderStyle('none !important')
shorthands.overflow(' hidden !important ')
`,
    },
    {
      name: 'leading and trailing spaces',
      code: `shorthands.margin(' 1em ')`,
    },
    {
      name: 'multiple arguments',
      code: `shorthands.border('2px', 'solid', 'black')`,
    },
    {
      name: 'CSS functions',
      code: `
shorthands.padding('calc(1em + 1px)')
shorthands.borderColor('rgb(255, 255, 255)')
`,
    },
  ],

  invalid: [
    {
      name: 'space separated arguments',
      code: `shorthands.border('2px solid black')`,
      output: `shorthands.border('2px', 'solid', 'black')`,
      errors: [{ messageId: 'invalidShorthandArgument' }],
    },
    {
      name: 'space separated arguments in template string',
      code: 'shorthands.borderRight(`2px solid ${tokens.colorNeutralStroke1}`)',
      output: 'shorthands.borderRight(`2px`, `solid`, `${tokens.colorNeutralStroke1}`)',
      errors: [{ messageId: 'invalidShorthandArgument' }],
    },
  ],
});
