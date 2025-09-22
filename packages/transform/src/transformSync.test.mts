import * as fs from 'node:fs';
import * as path from 'node:path';
import { format } from 'prettier';
import { describe, it, expect, vi } from 'vitest';

import { transformSync, type TransformOptions } from './transformSync.mjs';

type TestCase = {
  title: string;
  fixture: string;

  error?: RegExp;
  outputFixture?: string;

  only?: boolean;
  transformOptions?: Omit<TransformOptions, 'filename'>;

  setup?: () => (() => void) | void;
};

const prettierConfig = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../../../.prettierrc'), { encoding: 'utf-8' }),
);
const fixturesDir = path.join(__dirname, '..', '__fixtures__');

const TESTS: TestCase[] = [
  // 🎩 Tip: use "only: true" to run a single test
  // https://github.com/babel-utils/babel-plugin-tester#only
  //

  // Fixtures
  //
  //
  {
    title: 'at rules',
    fixture: path.resolve(fixturesDir, 'at-rules', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'at-rules', 'output.ts'),
  },
  {
    title: 'multiple declarations',
    fixture: path.resolve(fixturesDir, 'multiple-declarations', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'multiple-declarations', 'output.ts'),
  },
  {
    title: 'call of non existing module',
    fixture: path.resolve(fixturesDir, 'non-existing-module-call', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'non-existing-module-call', 'output.ts'),
  },
  {
    title: 'syntax: animationName',
    fixture: path.resolve(fixturesDir, 'keyframes', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'keyframes', 'output.ts'),
  },
  {
    title: 'syntax: CSS shorthands',
    fixture: path.resolve(fixturesDir, 'object-shorthands', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'object-shorthands', 'output.ts'),
  },
  {
    title: 'syntax: reset (null values)',
    fixture: path.resolve(fixturesDir, 'object-reset', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'object-reset', 'output.ts'),
  },

  // Assets
  //
  //
  {
    title: 'assets: import handling',
    fixture: path.resolve(fixturesDir, 'assets', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'assets', 'output.ts'),
  },
  {
    title: 'assets: multiple url()',
    fixture: path.resolve(fixturesDir, 'assets-multiple-declarations', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'assets-multiple-declarations', 'output.ts'),
  },
  {
    title: 'assets: url() without imports',
    fixture: path.resolve(fixturesDir, 'assets-urls', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'assets-urls', 'output.ts'),
  },

  // Evaluation
  //
  //
  {
    title: 'evaluation: mixins via functions',
    fixture: path.resolve(fixturesDir, 'function-mixin', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'function-mixin', 'output.ts'),
  },
  {
    title: 'evaluation: object',
    fixture: path.resolve(fixturesDir, 'object', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'object', 'output.ts'),
  },
  {
    title: 'evaluation: object with computed keys',
    fixture: path.resolve(fixturesDir, 'object-computed-keys', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'object-computed-keys', 'output.ts'),
  },
  {
    title: 'evaluation: object with imported keys',
    fixture: path.resolve(fixturesDir, 'object-imported-keys', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'object-imported-keys', 'output.ts'),
  },
  {
    title: 'evaluation: object with mixins',
    fixture: path.resolve(fixturesDir, 'object-mixins', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'object-mixins', 'output.ts'),
  },
  {
    title: 'evaluation: nested objects',
    fixture: path.resolve(fixturesDir, 'object-nesting', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'object-nesting', 'output.ts'),
  },
  {
    title: 'evaluation: objects with sequence expression',
    fixture: path.resolve(fixturesDir, 'object-sequence-expr', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'object-sequence-expr', 'output.ts'),
  },
  {
    title: 'evaluation: objects with variables',
    fixture: path.resolve(fixturesDir, 'object-variables', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'object-variables', 'output.ts'),
  },
  {
    title: 'evaluation: rules with metadata',
    fixture: path.resolve(fixturesDir, 'rules-with-metadata', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'rules-with-metadata', 'output.ts'),
  },
  {
    title: 'evaluation: shared mixins',
    fixture: path.resolve(fixturesDir, 'shared-mixins', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'shared-mixins', 'output.ts'),
  },
  {
    title: 'evaluation: tokens scenario',
    fixture: path.resolve(fixturesDir, 'tokens', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'tokens', 'output.ts'),
  },

  // Configs
  //
  //
  {
    title: 'config: classNameHashSalt',
    fixture: path.resolve(fixturesDir, 'config-classname-hash-salt', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'config-classname-hash-salt', 'output.ts'),
    transformOptions: {
      classNameHashSalt: 'prefix',
    },
  },
  {
    title: 'config: babelOptions',
    fixture: path.resolve(fixturesDir, 'config-babel-options', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'config-babel-options', 'output.ts'),
    transformOptions: {
      babelOptions: {
        plugins: ['./packages/transform/__fixtures__/config-babel-options/colorRenamePlugin'],
      },
    },
  },
  {
    title: 'config: evaluationRules',
    fixture: path.resolve(fixturesDir, 'config-evaluation-rules', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'config-evaluation-rules', 'output.ts'),
    transformOptions: {
      evaluationRules: [
        {
          action: path.resolve(fixturesDir, 'config-evaluation-rules', 'sampleEvaluator.cjs'),
        },
      ],
    },
  },

  // Reset styles
  //
  //
  {
    title: 'reset: default',
    fixture: path.resolve(fixturesDir, 'reset-styles', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'reset-styles', 'output.ts'),
  },
  {
    title: 'reset: assets',
    fixture: path.resolve(fixturesDir, 'assets-reset-styles', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'assets-reset-styles', 'output.ts'),
  },
  {
    title: 'reset: at rules',
    fixture: path.resolve(fixturesDir, 'reset-styles-at-rules', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'reset-styles-at-rules', 'output.ts'),
  },

  // Imports
  //

  {
    title: 'imports: alias usage',
    fixture: path.resolve(fixturesDir, 'import-alias', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'import-alias', 'output.ts'),
  },
  {
    title: 'imports: custom module',
    fixture: path.resolve(fixturesDir, 'import-custom-module', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'import-custom-module', 'output.ts'),
    transformOptions: {
      modules: ['custom-package'],
    },
  },

  // TODO: throws on CJS

  // Exports
  //

  {
    title: 'exports: handles default export',
    fixture: path.resolve(fixturesDir, 'export-default', 'code.ts'),
    outputFixture: path.resolve(fixturesDir, 'export-default', 'output.ts'),
  },

  // Errors
  //
  //

  {
    title: 'errors: unsupported shorthand CSS properties',
    fixture: path.resolve(fixturesDir, 'unsupported-css-properties', 'fixture.ts'),
    outputFixture: path.resolve(fixturesDir, 'unsupported-css-properties', 'output.ts'),
    setup() {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {
        // Suppress console errors during test
      });

      return function teardown() {
        consoleSpy.mockRestore();
      };
    },
  },
  {
    title: 'errors: throws on invalid argument count',
    fixture: path.resolve(fixturesDir, 'error-argument-count', 'fixture.js'),
    error: /function accepts only a single param/,
  },
  {
    title: 'errors: throws on undefined',
    fixture: path.resolve(fixturesDir, 'error-on-undefined', 'fixture.ts'),
    error: /Cannot read properties of undefined/,
  },
];

const DEFAULT_TRANSFORM_OPTIONS = {
  babelOptions: {
    presets: ['@babel/preset-typescript'],
  },
};

describe('transformSync', () => {
  for (const testCase of TESTS) {
    const testFn = testCase.only ? it.only : it;

    testFn(testCase.title, async () => {
      const sourceCode = fs.readFileSync(testCase.fixture, { encoding: 'utf-8' });
      const teardown = testCase.setup?.();

      const transformOptions = {
        ...DEFAULT_TRANSFORM_OPTIONS,
        ...(testCase.transformOptions || {}),
      };

      if (testCase.error) {
        expect(() =>
          transformSync(sourceCode, {
            filename: testCase.fixture,
            ...transformOptions,
          }),
        ).toThrow(testCase.error);
        return;
      }

      const { code, cssRulesByBucket, usedProcessing, usedVMForEvaluation } = transformSync(sourceCode, {
        filename: testCase.fixture,
        ...transformOptions,
      });
      const outputCode = format(code, { ...prettierConfig, parser: 'typescript' });
      const outputMeta = format(JSON.stringify({ usedProcessing, usedVMForEvaluation, cssRulesByBucket }, null, 2), {
        ...prettierConfig,
        parser: 'json',
      });

      await expect(outputCode).toMatchFileSnapshot(testCase.outputFixture!);
      await expect(outputMeta).toMatchFileSnapshot(testCase.outputFixture!.replace(/\.ts$/, '.meta.json'));

      if (typeof teardown === 'function') {
        teardown?.();
      }
    });
  }
});
