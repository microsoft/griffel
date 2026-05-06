import baseConfig from '../../eslint.config.mjs';
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';
import eslintPluginReactX from 'eslint-plugin-react-x';
import globals from 'globals';

export default [
  {
    ignores: ['**/dist', '**/out-tsc'],
  },
  ...baseConfig,
  eslintPluginReactX.configs['recommended-typescript'],
  eslintPluginReactHooks.configs.flat['recommended-latest'],
  eslintPluginReactX.configs['disable-conflict-eslint-plugin-react-hooks'],
  { languageOptions: { globals: { ...globals.webextensions } } },
  {
    files: ['**/pack-extension.js'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      'import-x/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: ['**/*.ts', '**/*.tsx', '**/webpack.config.js'],
          packageDir: ['.', './packages/devtools'],
        },
      ],
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
