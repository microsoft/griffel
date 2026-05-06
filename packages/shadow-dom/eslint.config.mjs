import baseConfig from '../../eslint.config.mjs';
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';
import eslintPluginReactX from 'eslint-plugin-react-x';

export default [
  {
    ignores: ['**/dist', '**/out-tsc'],
  },
  ...baseConfig,
  eslintPluginReactX.configs['recommended-typescript'],
  eslintPluginReactHooks.configs.flat['recommended-latest'],
  eslintPluginReactX.configs['disable-conflict-eslint-plugin-react-hooks'],
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
