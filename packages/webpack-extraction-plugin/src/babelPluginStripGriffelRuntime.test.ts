import pluginTester, { prettierFormatter } from 'babel-plugin-tester';
import * as fs from 'fs';
import * as path from 'path';

import { babelPluginStripGriffelRuntime } from './babelPluginStripGriffelRuntime';

const prettierConfig = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../../../.prettierrc'), { encoding: 'utf-8' }),
);
const fixturesDir = path.join(__dirname, '..', '__fixtures__', 'babel');

pluginTester({
  babelOptions: {
    parserOpts: {
      plugins: ['typescript'],
    },
  },
  pluginOptions: {
    resourceDirectory: process.cwd(),
  },
  formatResult: code =>
    prettierFormatter(code, {
      config: {
        ...prettierConfig,
        parser: 'typescript',
      },
    }),

  fixtures: fixturesDir,
  tests: [],

  plugin: babelPluginStripGriffelRuntime,
  pluginName: '@griffel/webpack-extraction-plugin/babel',
});
