import baseConfig from '../../eslint.config.mjs';
import eslintPluginReactCompiler from 'eslint-plugin-react-compiler';
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';
import eslintPluginReactX from 'eslint-plugin-react-x';

export default [
  {
    ignores: ['**/dist', '**/out-tsc'],
  },
  ...baseConfig,
  {
    files: ['**/__*.ts', '**/__*.tsx'],
    rules: {
      '@typescript-eslint/naming-convention': 'off',
    },
  },
  eslintPluginReactX.configs['recommended-typescript'],
  eslintPluginReactHooks.configs.flat['recommended-latest'],
  eslintPluginReactX.configs['disable-conflict-eslint-plugin-react-hooks'],
  eslintPluginReactCompiler.configs.recommended,
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
