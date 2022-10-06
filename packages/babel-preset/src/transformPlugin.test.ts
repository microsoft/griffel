import pluginTester, { prettierFormatter } from 'babel-plugin-tester';
import * as fs from 'fs';
import * as path from 'path';

import { transformPlugin } from './transformPlugin';

const prettierConfig = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../../../.prettierrc'), { encoding: 'utf-8' }),
);
const fixturesDir = path.join(__dirname, '..', '__fixtures__');

pluginTester({
  babelOptions: {
    parserOpts: {
      plugins: ['typescript'],
    },
  },
  pluginOptions: {
    babelOptions: {
      presets: ['@babel/typescript'],
    },
  },
  formatResult: code =>
    prettierFormatter(code, {
      config: {
        ...prettierConfig,
        parser: 'typescript',
      },
    }),
  tests: [
    // 🎩 Tip: use "only: true" to run a single test
    // https://github.com/babel-utils/babel-plugin-tester#only
    //

    // Fixtures
    //
    //
    {
      title: 'assets import handling',
      fixture: path.resolve(fixturesDir, 'assets', 'code.ts'),
      outputFixture: path.resolve(fixturesDir, 'assets', 'output.ts'),
    },
    {
      title: 'duplicated imports',
      fixture: path.resolve(fixturesDir, 'duplicated-imports', 'code.ts'),
      outputFixture: path.resolve(fixturesDir, 'duplicated-imports', 'output.ts'),
      pluginOptions: {
        modules: [{ moduleSource: 'custom-package', importName: 'createStylesA' }],
      },
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
      title: 'config: babelOptions',
      fixture: path.resolve(fixturesDir, 'config-babel-options', 'code.ts'),
      outputFixture: path.resolve(fixturesDir, 'config-babel-options', 'output.ts'),
      pluginOptions: {
        babelOptions: {
          plugins: ['./packages/babel-preset/__fixtures__/config-babel-options/colorRenamePlugin'],
        },
      },
    },
    {
      title: 'config: evaluationRules',
      fixture: path.resolve(fixturesDir, 'config-evaluation-rules', 'code.ts'),
      outputFixture: path.resolve(fixturesDir, 'config-evaluation-rules', 'output.ts'),
      pluginOptions: {
        evaluationRules: [
          {
            action: 'sampleEvaluator',
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

    // Imports
    //
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
      pluginOptions: {
        modules: [{ moduleSource: 'custom-package', importName: 'makeStyles' }],
      },
    },
    {
      title: 'imports: custom module name',
      fixture: path.resolve(fixturesDir, 'import-custom-name', 'code.ts'),
      outputFixture: path.resolve(fixturesDir, 'import-custom-name', 'output.ts'),
      pluginOptions: {
        modules: [{ moduleSource: 'custom-package', importName: 'createStyles' }],
      },
    },
    {
      title: 'imports: require()',
      fixture: path.resolve(fixturesDir, 'require', 'code.ts'),
      outputFixture: path.resolve(fixturesDir, 'require', 'output.ts'),
    },
    {
      title: 'imports: require() with custom module',
      fixture: path.resolve(fixturesDir, 'require-custom-module', 'code.ts'),
      outputFixture: path.resolve(fixturesDir, 'require-custom-module', 'output.ts'),
      pluginOptions: {
        modules: [{ moduleSource: 'custom-package', importName: 'makeStyles' }],
      },
    },

    {
      title: 'imports: require() for makeResetStyles',
      fixture: path.resolve(fixturesDir, 'require-reset-styles', 'code.ts'),
      outputFixture: path.resolve(fixturesDir, 'require-reset-styles', 'output.ts'),
    },

    // Errors
    //
    //
    {
      title: 'errors: unsupported shorthand CSS properties',
      fixture: path.resolve(fixturesDir, 'unsupported-css-properties', 'fixture.ts'),
      outputFixture: path.resolve(fixturesDir, 'unsupported-css-properties', 'output.ts'),
      setup() {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

        return function teardown() {
          consoleSpy.mockRestore();
        };
      },
    },
    {
      title: 'errors: throws on invalid argument type',
      fixture: path.resolve(fixturesDir, 'error-argument-type', 'fixture.js'),
      error: /function accepts only an object as a param/,
    },
    {
      title: 'errors: throws on invalid argument count',
      fixture: path.resolve(fixturesDir, 'error-argument-count', 'fixture.js'),
      error: /function accepts only a single param/,
    },
    {
      title: 'errors: throws on invalid config',
      fixture: path.resolve(fixturesDir, 'error-config-babel-options', 'fixture.ts'),
      pluginOptions: {
        babelOptions: {
          plugins: {},
        },
      },
      error: /Validation failed for passed config/,
    },
  ],

  plugin: transformPlugin,
  pluginName: '@griffel/babel-plugin-transform',
});
