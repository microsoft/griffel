import { fixupPluginRules } from '@eslint/compat';
import griffelPlugin from '@griffel/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2020,
      sourceType: 'module',
    },
    plugins: {
      '@griffel': fixupPluginRules(griffelPlugin),
    },
    rules: {
      '@griffel/hook-naming': 'error',
    },
  },
];
