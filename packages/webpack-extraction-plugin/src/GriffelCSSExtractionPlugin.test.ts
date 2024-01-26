import * as fs from 'fs';
import { createFsFromVolume, Volume } from 'memfs';
import * as MiniCssExtractPlugin from 'mini-css-extract-plugin';
import * as path from 'path';
import * as prettier from 'prettier';
import * as webpack from 'webpack';
import { merge } from 'webpack-merge';

import type { GriffelCSSExtractionPluginOptions } from './GriffelCSSExtractionPlugin';
import { GriffelCSSExtractionPlugin } from './GriffelCSSExtractionPlugin';
import type { WebpackLoaderOptions } from './webpackLoader';

type TestOptions = {
  only?: boolean;

  cssFilename?: string;
  loaderOptions?: WebpackLoaderOptions;
  pluginOptions?: GriffelCSSExtractionPluginOptions;
  webpackConfig?: webpack.Configuration;
};

const prettierConfig = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../../../.prettierrc'), { encoding: 'utf-8' }),
);

async function compileSourceWithWebpack(
  entryPath: string,
  options: TestOptions,
): Promise<{
  filesList: string[];
  cssOutput: string;
  moduleSource: string;
}> {
  const defaultConfig: webpack.Configuration = {
    context: __dirname,
    entry: {
      bundle: entryPath,
    },

    mode: 'production',
    devtool: false,

    output: {
      path: path.resolve(__dirname),
      filename: '[name].js',
      pathinfo: false,
      assetModuleFilename: '[name][ext]',
    },
    externals: {
      '@griffel/react': 'Griffel',
    },

    module: {
      rules: [
        {
          test: /\.(ts|tsx)$/,
          include: path.dirname(entryPath),
          use: {
            loader: GriffelCSSExtractionPlugin.loader,
            options: options.loaderOptions,
          },
        },
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, { loader: 'css-loader' }],
        },
        {
          test: /\.jpg$/,
          type: 'asset/resource',
        },
      ],
    },
    plugins: [
      new GriffelCSSExtractionPlugin(options.pluginOptions),
      new MiniCssExtractPlugin({
        filename: options.cssFilename ?? '[name].css',
      }),
    ],

    optimization: {
      concatenateModules: false,
      minimizer: [],
    },
    resolve: {
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

      const jsonStats = stats.toJson({ source: true });

      if (stats.hasErrors()) {
        reject(stats.toJson().errors![0]);
        return;
      }

      if (stats.hasWarnings()) {
        reject(stats.toJson().warnings![0]);
        return;
      }

      if (!Array.isArray(jsonStats.modules)) {
        reject(new Error(`"stats.toJson().modules" should be an array, this could be a compilation error...`));
        return;
      }

      const entryModule = jsonStats.modules.find(module => module.nameForCondition === entryPath);

      if (!entryModule) {
        reject(new Error(`Failed to find a fixture in "stats.toJson().modules", this could be a compilation error...`));
        return;
      }

      const filesList = (virtualFsVolume.readdirSync(__dirname) as string[]).sort();
      const cssOutput = filesList
        .filter(filename => filename.includes('.css'))
        .map(filename => {
          return (
            '\n' +
            `/** ${path.basename(filename)} **/` +
            '\n' +
            virtualFsVolume.readFileSync(path.resolve(__dirname, filename), {
              encoding: 'utf-8',
            })
          );
        })
        .join('');

      resolve({
        cssOutput,
        filesList,
        moduleSource: entryModule.source as string,
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
function testFixture(fixtureName: string, options: TestOptions = {}) {
  (options.only ? it.only : it)(
    `"${fixtureName}" fixture`,
    async () => {
      const fixturePath = path.resolve(__dirname, '..', '__fixtures__', 'webpack', fixtureName);

      const tsCodePath = path.resolve(fixturePath, 'code.ts');
      const tsxCodePath = path.resolve(fixturePath, 'code.tsx');

      const tsOutputPath = path.resolve(fixturePath, 'output.ts');
      const tsxOutputPath = path.resolve(fixturePath, 'output.tsx');

      const inputPath = [fs.existsSync(tsCodePath) && tsCodePath, fs.existsSync(tsxCodePath) && tsxCodePath].find(
        Boolean,
      );
      const outputPath = [
        fs.existsSync(tsOutputPath) && tsOutputPath,
        fs.existsSync(tsxOutputPath) && tsxOutputPath,
      ].find(Boolean);

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

      let resultModule = '';
      let resultCSS = '';
      let resultFsSnapshot: string[] = [];

      let resultError: Error | webpack.StatsError = new Error();

      try {
        const result = await compileSourceWithWebpack(inputPath, options);

        resultModule = fixLineEndings(
          prettier.format(result.moduleSource, {
            ...prettierConfig,
            parser: 'typescript',
          }),
        );
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

      const fsSnapshot = JSON.parse(await fs.promises.readFile(fsSnapshotPath, { encoding: 'utf8' }));
      expect(resultFsSnapshot).toMatchObject(fsSnapshot);

      if (outputPath) {
        const moduleOutput = fixLineEndings(await fs.promises.readFile(outputPath, { encoding: 'utf8' }));

        expect(resultModule).toBe(moduleOutput);
        return;
      }

      if (cssOutputPath) {
        const cssOutput = fixLineEndings(await fs.promises.readFile(cssOutputPath, { encoding: 'utf8' }));

        expect(resultCSS).toBe(cssOutput);
        return;
      }

      if (expectedError) {
        expect(resultError.message).toMatch(expectedError.default);
      }
    },
    15000,
  );
}

describe('GriffelCSSExtractionPlugin', () => {
  // Basic assertions
  // --------------------
  testFixture('basic-rules');
  testFixture('reset');
  testFixture('reset-media');
  testFixture('mixed');
  testFixture('empty');

  // Ensures that a file without __styles calls remains unprocessed
  testFixture('missing-calls');

  // Multiple calls of __styles
  testFixture('multiple');

  // Deduplicate rules in stylesheet
  testFixture('rules-deduplication');

  // Sorting rules by buckets
  testFixture('style-buckets');

  // Assets
  // --------------------
  testFixture('assets');
  testFixture('assets-flip');
  testFixture('assets-multiple');
  testFixture('reset-assets');

  // Config
  // --------------------

  // Custom filenames in mini-css-extract-plugin
  testFixture('config-name', { cssFilename: '[name].[contenthash].css' });

  // Config that disables SplitChunksPlugin
  testFixture('config-no-split-chunks', {
    webpackConfig: {
      optimization: {
        splitChunks: false,
      },
    },
  });

  // Config that forces chunk splitting
  testFixture('config-split-chunks', {
    webpackConfig: {
      optimization: {
        splitChunks: {
          cacheGroups: {
            styles: {
              enforce: true,
              name: 'split',
              test: /chunk[A|B]/,
              chunks: 'all',
            },
          },
        },
      },
    },
  });

  // Compatibility
  // --------------------

  // "pathinfo" adds comments with paths to output
  testFixture('basic-rules', { webpackConfig: { output: { pathinfo: true } } });

  // With existing CSS
  testFixture('with-css');

  // Chunks
  // --------------------
  testFixture('with-chunks');

  // Unstable
  // --------------------
  testFixture('unstable-attach-to-main', {
    pluginOptions: { unstable_attachToEntryPoint: 'main' },
    webpackConfig: {
      entry: {
        bundleB: path.resolve(__dirname, '..', '__fixtures__', 'webpack', 'unstable-attach-to-main', 'codeB.ts'),
      },
    },
  });
  testFixture('unstable-keep-original-code', { loaderOptions: { unstable_keepOriginalCode: true } });
});
