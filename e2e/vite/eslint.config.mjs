import path from 'node:path';

import baseConfig from '../../eslint.config.mjs';

const workspaceRoot = path.resolve(import.meta.dirname, '..', '..');

export default [
  {
    ignores: ['**/dist', '**/out-tsc'],
  },
  ...baseConfig,
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {},
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    rules: {},
  },
  {
    // Everything under src/** is test harness code — assets, scenario configs,
    // and the runner. Allow it to import devDependencies, and consult the
    // workspace root package.json so workspace-level devDeps (e.g. vite) do not
    // have to be re-declared here.
    files: ['**/src/**/*.{ts,tsx,js,jsx,mjs}'],
    rules: {
      'import-x/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: true,
          packageDir: [import.meta.dirname, workspaceRoot],
        },
      ],
    },
  },
];
