import baseConfig from '../../eslint.config.mjs';

export default [
  {
    ignores: ['**/dist', '**/out-tsc', '__fixtures__/**/*/output.ts'],
  },
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.tsx'],
    // Override or add rules here
    rules: {},
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    // Override or add rules here
    rules: {},
  },
  {
    files: ['vite.config.*', 'vitest.config.*'],
    rules: {
      'import/no-extraneous-dependencies': 'off',
    },
  },
];
