import * as fs from 'fs';
import { createFsFromVolume, Volume } from 'memfs';
import * as MiniCssExtractPlugin from 'mini-css-extract-plugin';
import * as path from 'path';
import * as prettier from 'prettier';
import * as webpack from 'webpack';
import { merge } from 'webpack-merge';

import { GriffelCSSExtractionPlugin } from './GriffelCSSExtractionPlugin';

type CompileOptions = {
  cssFilename?: string;
  webpackConfig?: webpack.Configuration;
};

const prettierConfig = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../../../.prettierrc'), { encoding: 'utf-8' }),
);

async function compileSourceWithWebpack(
  entryPath: string,
  options: CompileOptions,
): Promise<{
  filesList: string[];
  cssOutput: string;
}> {
  const defaultConfig: webpack.Configuration = {
    context: __dirname,
    entry: entryPath,

    mode: 'development',

    output: {
      path: path.resolve(__dirname),
      filename: 'bundle.js',
      pathinfo: false,
    },

    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          include: path.dirname(entryPath),
          use: {
            loader: GriffelCSSExtractionPlugin.loader,
          },
        },
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        },
      ],
    },
    plugins: [
      new GriffelCSSExtractionPlugin(),
      new MiniCssExtractPlugin({
        filename: options.cssFilename ?? '[name].css',
      }),
    ],

    resolve: {
      alias: {
        '@griffel/core': path.resolve(__dirname, '..', '..', '..', 'dist', 'packages', 'react', 'index.esm.js'),
        '@griffel/react': path.resolve(__dirname, '..', '..', '..', 'dist', 'packages', 'react', 'index.esm.js'),
      },
      extensions: ['.js', '.ts'],
    },
  };

  const webpackConfig = merge(defaultConfig, options.webpackConfig || {});
  const compiler = webpack(webpackConfig);

  const virtualFsVolume = createFsFromVolume(new Volume());

  compiler.outputFileSystem = virtualFsVolume;
  compiler.outputFileSystem.join = path.join.bind(path);

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) {
        reject(err);
        return;
      }

      if (typeof stats === 'undefined') {
        reject(new Error('"stats" from Webpack are not available, unknown error...'));
        return;
      }

      if (stats.hasErrors()) {
        reject(stats.toJson().errors![0]);
        return;
      }

      const filesList = virtualFsVolume.readdirSync(__dirname) as string[];

      const cssFilePath = path.resolve(
        __dirname,
        options.cssFilename ? filesList.find(filename => filename.includes('griffel')) ?? '' : 'griffel.css',
      );

      if (!virtualFsVolume.existsSync(cssFilePath)) {
        reject(new Error('"griffel.css" does not exist in filesystem'));
      }

      const cssOutput = virtualFsVolume.readFileSync(cssFilePath, {
        encoding: 'utf-8',
      }) as string;

      resolve({
        cssOutput,
        filesList,
      });
    });
  });
}

function fixLineEndings(value: string) {
  return String(value).replace(/\r?\n/g, '\n').trim();
}

/**
 * Test utility similar to "babel-plugin-tester".
 *
 * See https://webpack.js.org/contribute/writing-a-loader/#testing.
 */
function testFixture(fixtureName: string, options: CompileOptions = {}) {
  it(`"${fixtureName}" fixture`, async () => {
    const fixturePath = path.resolve(__dirname, '..', '__fixtures__', 'webpack', fixtureName);

    const tsCodePath = path.resolve(fixturePath, 'code.ts');
    const tsxCodePath = path.resolve(fixturePath, 'code.tsx');

    const inputPath = [fs.existsSync(tsCodePath) && tsCodePath, fs.existsSync(tsxCodePath) && tsxCodePath].find(
      Boolean,
    );

    const errorPath = path.resolve(fixturePath, 'error.ts');
    const expectedError = fs.existsSync(errorPath) && require(errorPath);

    const fsSnapshotPath = path.resolve(fixturePath, 'fs.json');
    const cssOutputPath = path.resolve(fixturePath, 'output.css');

    if (!inputPath) {
      throw new Error(`Failed to find "code.{js,ts,tsx}" in "${fixturePath}"`);
    }

    if (!fs.existsSync(fsSnapshotPath)) {
      throw new Error(`Failed to find "fs.json" in "${fixturePath}"`);
    }

    if (!fs.existsSync(cssOutputPath)) {
      throw new Error(`Failed to find "output.css" in "${fixturePath}"`);
    }

    if (!cssOutputPath && !expectedError) {
      throw new Error(`Failed to find "output.css" or "error.ts" in "${fixturePath}"`);
    }

    if (expectedError) {
      if (!expectedError.default) {
        throw new Error(
          `Please check that "error.ts" contains a default export with an error or regex in "${fixturePath}"`,
        );
      }
    }

    let resultCSS = '';
    let resultFsSnapshot: string[] = [];

    let resultError: Error | webpack.StatsError = new Error();

    try {
      const result = await compileSourceWithWebpack(inputPath, options);

      resultCSS = fixLineEndings(
        prettier.format(result.cssOutput, {
          ...prettierConfig,
          parser: 'css',
        }),
      );
      resultFsSnapshot = result.filesList;
    } catch (err) {
      if (expectedError) {
        resultError = err as webpack.StatsError;
      } else {
        throw err;
      }
    }

    if (cssOutputPath) {
      const cssOutput = fixLineEndings(await fs.promises.readFile(cssOutputPath, { encoding: 'utf8' }));
      const fsSnapshot = JSON.parse(await fs.promises.readFile(fsSnapshotPath, { encoding: 'utf8' }));

      expect(resultFsSnapshot).toMatchObject(fsSnapshot);
      expect(resultCSS).toBe(cssOutput);
      return;
    }

    if (expectedError) {
      expect(resultError.message).toMatch(expectedError.default);
    }
  }, 15000);
}

describe('webpackLoader', () => {
  // Basic assertions
  testFixture('basic-rules');

  // Multiple calls of __styles
  testFixture('multiple');

  // Deduplicate rules in stylesheet
  testFixture('rules-deduplication');

  // Sorting rules by buckets
  testFixture('style-buckets');

  // Custom filenames in mini-css-extract-plugin
  testFixture('config-name', { cssFilename: '[name].[contenthash].css' });

  // "pathinfo" adds comments with paths to output
  testFixture('basic-rules', { webpackConfig: { output: { pathinfo: true } } });
});
