import nx from '@nx/eslint-plugin';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import eslintPluginImportX from 'eslint-plugin-import-x';
import storybook from 'eslint-plugin-storybook';

export default [
  {
    ignores: ['**/dist', '**/out-tsc', '**/node_modules', '**/__fixtures__/**', '**/bundle-size/**', '**/vite.config.*.timestamp*', '**/vitest.config.*.timestamp*'],
  },
  eslintPluginImportX.flatConfigs.typescript,
  ...storybook.configs['flat/recommended'],
  ...nx.configs['flat/base'],
  {
    settings: {
      'import-x/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.base.json',
        },
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          disallowTypeAnnotations: false,
          fixStyle: 'separate-type-imports',
          prefer: 'type-imports',
        },
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'function', format: ['camelCase', 'PascalCase'], leadingUnderscore: 'forbid' },
        { selector: 'objectLiteralMethod', format: ['camelCase'] },
      ],
      'import-x/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: false,
        },
      ],
      eqeqeq: 'error',
      'guard-for-in': 'error',
      'max-classes-per-file': 'error',
      'no-cond-assign': ['error', 'always'],
      'no-console': 'error',
      'no-useless-concat': 'error',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.js', '**/*.jsx', '**/*.mjs'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
    },
    ignores: ['**/*.fixture.js', '**/.storybook/main.js', '**/eslint.config.mjs'],
  },
  ...nx.configs['flat/typescript'],
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.mts'],
    rules: {
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-require-imports': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-redeclare': 'off',
    },
  },
  ...nx.configs['flat/javascript'],
  {
    files: ['**/*.js', '**/*.jsx', '**/*.mjs'],
    rules: {},
  },
  {
    files: [
      '**/__fixtures__/**/*',
      '**/*.stories.ts',
      '**/*.stories.tsx',
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.test.mts',
      '**/vitest.config.ts',
      '**/vitest.config.mts',
      '**/vitest.setup.ts',
      '**/.storybook/main.js',
      '**/eslint.config.mjs',
    ],
    rules: {
      'import-x/no-extraneous-dependencies': 'off',
    },
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.test.mts', '**/*.spec.ts', '**/*.spec.tsx'],
    rules: {
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      'import-x/first': 'off',
      'no-console': 'off',
    },
  },
  {
    files: ['tools/**/*', 'e2e/**/*'],
    rules: {
      'no-console': 'off',
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.mts'],
    rules: {
      'no-redeclare': 'off',
    },
  },
  {
    ignores: ['packages/*/dist'],
  },
  eslintConfigPrettier,
];
