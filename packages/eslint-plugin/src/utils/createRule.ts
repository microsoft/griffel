import { ESLintUtils } from '@typescript-eslint/utils';

const getDocsUrl = (ruleName: string): string =>
  `https://github.com/microsoft/griffel/tree/main/packages/eslint-plugin/src/rules/${ruleName}.md`;

export const createRule: ReturnType<typeof ESLintUtils.RuleCreator> = (...args) =>
  ESLintUtils.RuleCreator(getDocsUrl)(...args);
