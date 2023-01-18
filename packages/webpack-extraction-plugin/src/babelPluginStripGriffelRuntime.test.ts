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

    {
      title: 'basic (makeStyles)',
      fixture: path.resolve(fixturesDir, 'basic', 'code.ts'),
      outputFixture: path.resolve(fixturesDir, 'basic', 'output.ts'),
    },
    {
      title: 'basic (makeResetStyles)',
      fixture: path.resolve(fixturesDir, 'reset', 'code.ts'),
      outputFixture: path.resolve(fixturesDir, 'reset', 'output.ts'),
    },

    {
      title: 'multiple declarations (makeStyles)',
      fixture: path.resolve(fixturesDir, 'multiple', 'code.ts'),
      outputFixture: path.resolve(fixturesDir, 'multiple', 'output.ts'),
    },
    {
      title: 'mixed (makeStyles + makeResetStyles)',
      fixture: path.resolve(fixturesDir, 'mixed', 'code.ts'),
      outputFixture: path.resolve(fixturesDir, 'mixed', 'output.ts'),
    },

    {
      title: 'alias imports (makeStyles)',
      fixture: path.resolve(fixturesDir, 'alias', 'code.ts'),
      outputFixture: path.resolve(fixturesDir, 'alias', 'output.ts'),
    },
  ],

  plugin: babelPluginStripGriffelRuntime,
  pluginName: '@griffel/webpack-extraction-plugin/babel',
});
