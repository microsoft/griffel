import baseConfig from '../../eslint.config.mjs';
import nx from '@nx/eslint-plugin';
import globals from 'globals';

export default [
  {
    ignores: ['**/dist', '**/out-tsc'],
  },
  ...nx.configs['flat/react'],
  ...baseConfig,
  { languageOptions: { globals: { ...globals.webextensions } } },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      'import/no-extraneous-dependencies': [
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
