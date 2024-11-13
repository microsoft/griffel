import { TSESLint } from '@typescript-eslint/utils';
import * as path from 'path';

import { noDeprecatedShorthandsRule, RULE_NAME } from './no-deprecated-shorthands';

const ruleTester = new TSESLint.RuleTester({
  parser: path.resolve('./node_modules/@typescript-eslint/parser/dist'),
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
});

ruleTester.run(RULE_NAME, noDeprecatedShorthandsRule, {
  valid: [
    {
      name: 'borderColor is a valid shorthand',
      code: `
import { makeStyles, shorthands } from '@griffel/react';

export const useStyles = makeStyles({
  root: {
    ...shorthands.borderColor('red')
  }
})`,
    },
    {
      name: 'borderStyle is a valid shorthand',
      code: `
import { makeStyles, shorthands } from '@griffel/react';

export const useStyles = makeStyles({
  root: {
    ...shorthands.borderStyle('2px')
  }
})`,
    },
    {
      name: 'borderWidth is a valid shorthand',
      code: `
import { makeStyles, shorthands } from '@griffel/react';

export const useStyles = makeStyles({
  ...shorthands.borderWidth('2px')
})`,
    },
    {
      name: 'Valid shorthand assignment variable',
      code: `
import { makeStyles, shorthands } from '@griffel/react';

const borderWidthStyle = shorthands.borderWidth('2px');

export const useStyles = makeStyles({
  ...borderWidthStyle
})`,
    },
    {
      name: '"invalidFunction" is not a valid shorthand function name, it should be caught by typings instead',
      code: `
import { makeStyles, shorthands } from '@griffel/react';

export const useStyles = makeStyles({
  ...shorthands.invalidFunction('2px')
})`,
    },
  ],

  invalid: [
    {
      name: 'border shorthands function is deprecated',
      code: `
import { makeStyles, shorthands } from '@griffel/react';

export const useStyles = makeStyles({
  root: {
    ...shorthands.border('2px')
  }
});`,
      errors: [{ messageId: 'invalidShorthand' }],
    },
    {
      name: 'borderBottom shorthands function is deprecated',
      code: `
import { makeStyles, shorthands } from '@griffel/react';

export const useStyles = makeStyles({
  root: {
    ...shorthands.borderBottom('2px')
  }
});`,
      errors: [{ messageId: 'invalidShorthand' }],
    },
    {
      name: 'borderLeft shorthands function is deprecated',
      code: `
import { makeStyles, shorthands } from '@griffel/react';

export const useStyles = makeStyles({
  root: {
    ...shorthands.borderLeft('2px')
  }
});`,
      errors: [{ messageId: 'invalidShorthand' }],
    },
    {
      name: 'borderRadius shorthands function is deprecated',
      code: `
import { makeStyles, shorthands } from '@griffel/react';

export const useStyles = makeStyles({
  root: {
    ...shorthands.borderRadius('10px')
  }
});`,
      errors: [{ messageId: 'invalidShorthand' }],
    },
    {
      name: 'borderRight shorthands function is deprecated',
      code: `
import { makeStyles, shorthands } from '@griffel/react';

export const useStyles = makeStyles({
  root: {
    ...shorthands.borderRight('2px')
  }
});`,
      errors: [{ messageId: 'invalidShorthand' }],
    },
    {
      name: 'borderTop shorthands function is deprecated',
      code: `
import { makeStyles, shorthands } from '@griffel/react';

export const useStyles = makeStyles({
  root: {
    ...shorthands.borderTop('2px')
  }
});`,
      errors: [{ messageId: 'invalidShorthand' }],
    },
    {
      name: 'overflow shorthands function is deprecated',
      code: `
import { makeStyles, shorthands } from '@griffel/react';

export const useStyles = makeStyles({
  root: {
    ...shorthands.overflow(' hidden !important ')
  }
});`,
      errors: [{ messageId: 'invalidShorthand' }],
    },
    {
      name: 'padding shorthands function is deprecated',
      code: `
import { makeStyles, shorthands } from '@griffel/react';

export const useStyles = makeStyles({
  root: {
    ...shorthands.padding('calc(1em + 1px)')
  }
});`,
      errors: [{ messageId: 'invalidShorthand' }],
    },
    {
      name: 'flex shorthands function is deprecated',
      code: `
import { makeStyles, shorthands } from '@griffel/react';

export const useStyles = makeStyles({
  root: {
    ...shorthands.flex('auto')
  }
});`,
      errors: [{ messageId: 'invalidShorthand' }],
    },
    {
      name: 'Valid assignment of deprecated border shorthand',
      code: `
import { makeStyles, shorthands } from '@griffel/react';

const borderStyle = shorthands.border('2px');

export const useStyles = makeStyles({
  ...borderStyle
})`,
      errors: [{ messageId: 'invalidShorthand' }],
    },
  ],
});
