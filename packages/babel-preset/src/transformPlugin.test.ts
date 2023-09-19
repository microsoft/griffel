import * as Babel from '@babel/core';
import pluginTester, { prettierFormatter } from 'babel-plugin-tester';
import * as fs from 'fs';
import * as path from 'path';

import { transformPlugin } from './transformPlugin';
import { BabelPluginMetadata } from './types';

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
      prettierOptions: {
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
      title: 'duplicated imports',
      fixture: path.resolve(fixturesDir, 'duplicated-imports', 'code.ts'),
      outputFixture: path.resolve(fixturesDir, 'duplicated-imports', 'output.ts'),
      pluginOptions: {
        modules: [{ moduleSource: 'custom-package', importName: 'createStylesA' }],
      },
    },
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
    {
      title: 'reset: at rules',
      fixture: path.resolve(fixturesDir, 'reset-styles-at-rules', 'code.ts'),
      outputFixture: path.resolve(fixturesDir, 'reset-styles-at-rules', 'output.ts'),
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

// TODO use the plugin tester and all existing fixtures once there is support for that
// https://github.com/babel-utils/babel-plugin-tester/issues/186
describe('babel preset', () => {
  it('should not generate metadata when not configured', () => {
    const fixture = path.resolve(fixturesDir, 'object', 'code.ts');
    const code = fs.readFileSync(fixture).toString();

    const babelFileResult = Babel.transformSync(code, {
      babelrc: false,
      configFile: false,
      plugins: [[transformPlugin]],
      filename: fixture,
      presets: ['@babel/typescript'],
    });

    expect(babelFileResult?.metadata).toMatchInlineSnapshot(`Object {}`);
  });

  it('should return empty metadata when file contains no griffel code', () => {
    const code = 'export {}';
    const babelFileResult = Babel.transformSync(code, {
      babelrc: false,
      configFile: false,
      plugins: [[transformPlugin, { generateMetadata: true }]],
      filename: 'test.js',
      presets: ['@babel/typescript'],
    });

    expect((babelFileResult?.metadata as BabelPluginMetadata | undefined)?.cssEntries).toEqual({});
    expect((babelFileResult?.metadata as BabelPluginMetadata | undefined)?.cssResetEntries).toEqual({});
  });

  it('should generate metadata for makeStyles when configured', () => {
    const fixture = path.resolve(fixturesDir, 'object', 'code.ts');
    const code = fs.readFileSync(fixture).toString();

    const babelFileResult = Babel.transformSync(code, {
      babelrc: false,
      configFile: false,
      plugins: [[transformPlugin, { generateMetadata: true }]],
      filename: fixture,
      presets: ['@babel/typescript'],
    });

    expect(babelFileResult?.metadata).toMatchInlineSnapshot(`
      Object {
        cssEntries: Object {
          useStyles: Object {
            icon: Array [
              .fcnqdeg{background-color:green;},
              .fjf1xye{margin-left:4px;},
              .f8zmjen{margin-right:4px;},
            ],
            root: Array [
              .fe3e8s9{color:red;},
              .fycuoez{padding-left:4px;},
              .f8wuabp{padding-right:4px;},
            ],
          },
        },
        cssResetEntries: Object {},
      }
    `);
  });

  it('should generate metadata for makeResetStyles when configured', () => {
    const fixture = path.resolve(fixturesDir, 'reset-styles', 'code.ts');
    const code = fs.readFileSync(fixture).toString();

    const babelFileResult = Babel.transformSync(code, {
      babelrc: false,
      configFile: false,
      plugins: [[transformPlugin, { generateMetadata: true }]],
      filename: fixture,
      presets: ['@babel/typescript'],
    });

    expect(babelFileResult?.metadata).toMatchInlineSnapshot(`
      Object {
        cssEntries: Object {},
        cssResetEntries: Object {
          useStyles: Array [
            .rjefjbm{color:red;padding-left:4px;},
            .r7z97ji{color:red;padding-right:4px;},
          ],
        },
      }
    `);
  });
});
