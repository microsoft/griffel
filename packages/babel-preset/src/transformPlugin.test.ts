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

  fixtures: fixturesDir,
  tests: [
    {
      title: 'Unsupported shorthand CSS properties',
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
