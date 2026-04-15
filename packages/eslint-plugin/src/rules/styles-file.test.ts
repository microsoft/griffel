import { RuleTester } from '@typescript-eslint/rule-tester';
import * as tsParser from '@typescript-eslint/parser';

import { stylesFileRule, RULE_NAME } from './styles-file';

const componentFileName = 'packages/components/components-foo/foo.tsx';
const stylesFileName = 'packages/components/components-foo/foo.styles.ts';

const ruleTester = new RuleTester({
  languageOptions: { parser: tsParser, ecmaVersion: 2018, sourceType: 'module' },
});

const codeWithFluentNamespaceImport = `
import * as fluent from '@fluentui/react-components';

export const useStyles = fluent.makeStyles({
  root: { color: 'blue' },
});
`;
const codeWithMakeStylesImport = `
import { makeStyles } from '@fluentui/react-components';

export const useStyles = makeStyles({
  root: { color: 'blue' },
});
`;

ruleTester.run(RULE_NAME, stylesFileRule, {
  valid: [
    {
      code: `
        import { Button } from "@fluentui/react-components";
        const tag = <Button>test content</Button>;
      `,
      filename: componentFileName,
    },
    // import and use makeStyles in COMPONENT_NAME.styles.ts is okay
    {
      code: codeWithFluentNamespaceImport,
      filename: stylesFileName,
    },
    {
      code: codeWithMakeStylesImport,
      filename: stylesFileName,
    },
    {
      code: `
        import { makeStyles } from '@fluentui/react-components';

        const useStyles = makeStyles({
          root: { color: 'blue' },
        });
        const useStyles1 = makeStyles({
          root: { color: 'red' },
        });

        export { useStyles as foo, useStyles1 as bar };
      `,
      filename: stylesFileName,
    },
  ],
  invalid: [
    // Error when import and use makeStyles in component
    {
      code: codeWithFluentNamespaceImport,
      errors: [{ messageId: 'foundMakeStylesUsage' }],
      filename: componentFileName,
    },
    {
      code: codeWithMakeStylesImport,
      errors: [{ messageId: 'foundMakeStylesUsage' }],
      filename: componentFileName,
    },
  ],
});
