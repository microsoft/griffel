import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import js from '@eslint/js';
import nx from '@nx/eslint-plugin';
import eslintPluginImport from 'eslint-plugin-import';
import eslintPluginJest from 'eslint-plugin-jest';

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
  recommendedConfig: js.configs.recommended,
});

export default [
  {
    ignores: ['**/dist', '**/out-tsc', '**/node_modules', '**/__fixtures__/**', '**/vite.config.*.timestamp*', '**/vitest.config.*.timestamp*'],
  },
  ...compat.extends('plugin:import/typescript', 'plugin:storybook/recommended'),
  ...nx.configs['flat/base'],
  {
    plugins: {
      import: eslintPluginImport,
      jest: eslintPluginJest,
    },
  },
  {
    settings: {
      'import/resolver': {
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
      'import/no-extraneous-dependencies': [
        'error',
        {
          devDependencies: false,
        },
      ],
      'jest/no-focused-tests': 'error',
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
      '**/jest.setup.js',
      '**/jest.setup.ts',
      '**/vitest.config.ts',
      '**/vitest.config.mts',
      '**/.storybook/main.js',
      '**/eslint.config.mjs',
    ],
    rules: {
      'import/no-extraneous-dependencies': 'off',
    },
  },
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.test.mts', '**/*.spec.ts', '**/*.spec.tsx'],
    rules: {
      '@typescript-eslint/no-empty-function': 'off',
      'import/first': 'off',
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
];
