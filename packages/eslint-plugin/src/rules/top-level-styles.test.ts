import { TSESLint } from '@typescript-eslint/utils';
import { stylesFileRule, RULE_NAME } from './top-level-styles';
import * as path from 'path';

const componentFileName = 'packages/components/components-foo/foo.tsx';

const ruleTester = new TSESLint.RuleTester({
  parser: path.resolve('./node_modules/@typescript-eslint/parser/dist'),
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
});

ruleTester.run(RULE_NAME, stylesFileRule, {
  valid: [
    {
      code: `
import { makeStyles } from '@fluentui/react-components';

export const useStyles = makeStyles({
  root: { color: 'blue' },
});
`,
      filename: componentFileName,
    },
    {
      code: `
import { makeStyles } from 'unknown-package';

export function getStyles() {
  const useStyles = makeStyles({
    root: { color: 'blue' },
  });

  return useStyles;
}
`,
      filename: componentFileName,
    },
  ],

  invalid: [
    {
      code: `
        import { makeStyles } from '@fluentui/react-components';
        function getStyles() {
          const useStyles = makeStyles({
            root: { color: 'blue' },
          });

          return useStyles;
        }
      `,
      errors: [{ messageId: 'foundInvalidUsage', data: { methodName: 'makeStyles' } }],
      filename: componentFileName,
    },
    {
      code: `
        import { makeStaticStyles } from '@fluentui/react-components';
        function getStyles() {
          const useStyles = makeStaticStyles({
            root: { color: 'blue' },
          });

          return useStyles;
        }
      `,
      errors: [{ messageId: 'foundInvalidUsage', data: { methodName: 'makeStaticStyles' } }],
      filename: componentFileName,
    },
    {
      code: `
        import { makeResetStyles } from '@fluentui/react-components';
        function getStyles() {
          const useStyles = makeResetStyles({
            root: { color: 'blue' },
          });

          return useStyles;
        }
      `,
      errors: [{ messageId: 'foundInvalidUsage', data: { methodName: 'makeResetStyles' } }],
      filename: componentFileName,
    },
    {
      code: `
        import { makeStyles } from '@griffel/react';
        const getStyles = () => {
          const useStyles = makeStyles({
            root: { color: 'blue' },
          });

          return useStyles;
        };
      `,
      errors: [{ messageId: 'foundInvalidUsage', data: { methodName: 'makeStyles' } }],
      filename: componentFileName,
    },
    {
      code: `
        import { makeStyles } from '@fluentui/react-components';

        class MyClass {
          constructor() {
            const useStyles = makeStyles({
              root: { color: 'blue' },
            });
          }
        }
      `,
      errors: [{ messageId: 'foundInvalidUsage', data: { methodName: 'makeStyles' } }],
      filename: componentFileName,
    },
  ],
});
