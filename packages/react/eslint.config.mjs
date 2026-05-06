import baseConfig from '../../eslint.config.mjs';
import nx from '@nx/eslint-plugin';
import eslintPluginReactCompiler from 'eslint-plugin-react-compiler';

export default [
  {
    ignores: ['**/dist', '**/out-tsc'],
  },
  ...nx.configs['flat/react'],
  ...baseConfig,
  { plugins: { 'react-compiler': eslintPluginReactCompiler } },
  {
    files: ['**/__*.ts', '**/__*.tsx'],
    rules: {
      '@typescript-eslint/naming-convention': 'off',
    },
  },
  {
    rules: {
      'react-compiler/react-compiler': 'error',
    },
  },
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
];
