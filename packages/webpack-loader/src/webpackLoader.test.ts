import * as fs from 'fs';
import { createFsFromVolume, Volume } from 'memfs';
import * as path from 'path';
import * as prettier from 'prettier';
import * as webpack from 'webpack';
import { merge } from 'webpack-merge';

import type { WebpackLoaderOptions } from './webpackLoader';
import { shouldTransformSourceCode } from './webpackLoader';

type CompileOptions = {
  loaderOptions?: WebpackLoaderOptions;
  webpackConfig?: webpack.Configuration;
};

const prettierConfig = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../../../.prettierrc'), { encoding: 'utf-8' }),
);

async function compileSourceWithWebpack(entryPath: string, options: CompileOptions): Promise<string> {
  const defaultConfig: webpack.Configuration = {
    context: __dirname,
    entry: entryPath,

    mode: 'development',

    output: {
      path: path.resolve(__dirname),
      filename: 'bundle.js',
    },
    externals: {
      '@griffel/react': 'Griffel',
    },

    module: {
      rules: [
        {
          test: /\.(ts|tsx|txt)$/,
          include: path.dirname(entryPath),
          use: {
            loader: path.resolve(__dirname, './index.ts'),
            options: options.loaderOptions,
          },
        },
      ],
    },

    resolve: {
      extensions: ['.js', '.ts'],
    },
  };

  const webpackConfig = merge(defaultConfig, options.webpackConfig || {});
  const compiler = webpack(webpackConfig);

  compiler.outputFileSystem = createFsFromVolume(new Volume());
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

      if (!Array.isArray(jsonStats.modules)) {
        reject(new Error(`"stats.toJson().modules" should be an array, this could be a compilation error...`));
        return;
      }

      const entryModule = jsonStats.modules.find(module => module.nameForCondition === entryPath);

      if (!entryModule) {
        reject(new Error(`Failed to find a fixture in "stats.toJson().modules", this could be a compilation error...`));
        return;
      }

      resolve(entryModule.source as string);
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
    const fixturePath = path.resolve(__dirname, '..', '__fixtures__', fixtureName);

    const tsCodePath = path.resolve(fixturePath, 'code.ts');
    const tsxCodePath = path.resolve(fixturePath, 'code.tsx');
    // Specially for cases when "code" contains syntax errors
    const txtCodePath = path.resolve(fixturePath, 'code.txt');

    const tsOutputPath = path.resolve(fixturePath, 'output.ts');
    const tsxOutputPath = path.resolve(fixturePath, 'output.tsx');

    const inputPath = [
      fs.existsSync(tsCodePath) && tsCodePath,
      fs.existsSync(tsxCodePath) && tsxCodePath,
      fs.existsSync(txtCodePath) && txtCodePath,
    ].find(Boolean);
    const outputPath = [
      fs.existsSync(tsOutputPath) && tsOutputPath,
      fs.existsSync(tsxOutputPath) && tsxOutputPath,
    ].find(Boolean);

    const errorPath = path.resolve(fixturePath, 'error.ts');
    const expectedError = fs.existsSync(errorPath) && require(errorPath);

    if (!inputPath) {
      throw new Error(`Failed to find "code.{js,ts,tsx}" in "${fixturePath}"`);
    }

    if (!outputPath && !expectedError) {
      throw new Error(`Failed to find "output.{js,ts,tsx}" or "error.ts" in "${fixturePath}"`);
    }

    if (expectedError) {
      if (!expectedError.default) {
        throw new Error(
          `Please check that "error.ts" contains a default export with an error or regex in "${fixturePath}"`,
        );
      }
    }

    let result = '';
    let resultError: Error | webpack.StatsError = new Error();

    try {
      result = fixLineEndings(
        prettier.format(await compileSourceWithWebpack(inputPath, options), {
          ...prettierConfig,
          parser: 'typescript',
        }),
      );
    } catch (err) {
      if (expectedError) {
        resultError = err as webpack.StatsError;
      } else {
        throw err;
      }
    }

    if (outputPath) {
      const output = fixLineEndings(await fs.promises.readFile(outputPath, 'utf8'));

      expect(result).toBe(output);
      return;
    }

    if (expectedError) {
      expect(resultError.message).toMatch(expectedError.default);
    }
  });
}

describe('shouldTransformSourceCode', () => {
  describe('handles defaults', () => {
    it('makeStyles', () => {
      expect(shouldTransformSourceCode(`import { makeStyles } from "@griffel/react"`, undefined)).toBe(true);
      expect(shouldTransformSourceCode(`import { Button } from "@fluentui/react"`, undefined)).toBe(false);
    });

    it('makeResetStyles', () => {
      expect(shouldTransformSourceCode(`import { makeResetStyles } from "@griffel/react"`, undefined)).toBe(true);
      expect(shouldTransformSourceCode(`import { Button } from "@fluentui/react"`, undefined)).toBe(false);
    });
  });

  describe('handles options', () => {
    it('makeStyles', () => {
      expect(
        shouldTransformSourceCode(`import { makeStyles } from "@griffel/react"`, [
          { moduleSource: '@griffel/react', importName: 'makeStyles' },
        ]),
      ).toBe(true);
      expect(
        shouldTransformSourceCode(`import { createStyles } from "make-styles"`, [
          { moduleSource: 'make-styles', importName: 'createStyles' },
        ]),
      ).toBe(true);

      expect(
        shouldTransformSourceCode(`import { Button } from "@fluentui/react"`, [
          { moduleSource: '@griffel/react', importName: 'makeStyles' },
        ]),
      ).toBe(false);
    });

    it('makeResetStyles', () => {
      expect(
        shouldTransformSourceCode(`import { makeResetStyles } from "@griffel/react"`, [
          { moduleSource: '@griffel/react', importName: 'makeStyles', resetImportName: 'makeResetStyles' },
        ]),
      ).toBe(true);
      expect(
        shouldTransformSourceCode(`import { createResetStyles } from "make-styles"`, [
          { moduleSource: 'make-styles', importName: 'makeStyles', resetImportName: 'createResetStyles' },
        ]),
      ).toBe(true);

      expect(
        shouldTransformSourceCode(`import { Button } from "@fluentui/react"`, [
          { moduleSource: '@griffel/react', importName: 'makeStyles', resetImportName: 'makeResetStyles' },
        ]),
      ).toBe(false);
    });
  });
});

describe('webpackLoader', () => {
  describe('AOT fixtures', () => {
    // Integration fixtures for base functionality, all scenarios are tested in "@griffel/babel-preset"
    testFixture('aot/object');
    testFixture('aot/function');
    testFixture('aot/reset');
    testFixture('aot/empty');

    // Integration fixtures for config functionality
    testFixture('aot/config-classname-hash-salt', {
      loaderOptions: {
        classNameHashSalt: 'HASH_SALT',
      },
    });

    testFixture('aot/config-modules', {
      loaderOptions: {
        modules: [{ moduleSource: 'react-make-styles', importName: 'makeStyles' }],
      },
      webpackConfig: {
        externals: {
          'react-make-styles': 'Griffel',
        },
      },
    });

    // Asserts that aliases are resolved properly in Babel plugin
    testFixture('aot/webpack-aliases', {
      webpackConfig: {
        resolve: {
          alias: {
            'non-existing-color-module': path.resolve(
              __dirname,
              '..',
              '__fixtures__',
              'aot',
              'webpack-aliases',
              'color.ts',
            ),
          },
        },
      },
    });

    // Asserts that "inheritResolveOptions" are handled properly
    testFixture('aot/webpack-inherit-resolve-options', {
      loaderOptions: {
        inheritResolveOptions: ['extensions'],
      },
      webpackConfig: {
        resolve: {
          extensions: ['.ts', '.jsx'],
        },
      },
    });

    // Asserts that "webpackResolveOptions" are handled properly
    testFixture('aot/webpack-resolve-options', {
      loaderOptions: {
        webpackResolveOptions: {
          extensions: ['.ts', '.jsx'],
        },
      },
    });

    // Asserts that aliases are resolved properly in Babel plugin with resolve plugins
    testFixture('aot/webpack-resolve-plugins', {
      webpackConfig: {
        resolve: {
          plugins: [
            {
              // Simple plugin that will detect the non-existent module we are testing for and replace with
              // correct path from the fixture
              apply: function (resolver) {
                const target = resolver.ensureHook('resolve');

                resolver.getHook('before-resolve').tapAsync('ResolveFallback', (request, resolveContext, callback) => {
                  if (request.request === 'non-existing-color-module') {
                    const obj = {
                      directory: request.directory,
                      path: request.path,
                      query: request.query,
                      request: path.resolve(
                        __dirname,
                        '..',
                        '__fixtures__',
                        'aot',
                        'webpack-resolve-plugins',
                        'color.ts',
                      ),
                    };
                    return resolver.doResolve(target, obj, null, resolveContext, callback);
                  }

                  callback();
                });
              },
            },
          ],
        },
      },
    });

    // Asserts handling errors from Babel plugin
    testFixture('aot/error-argument-count');
    // Asserts errors in loader's config
    testFixture('aot/error-config', {
      loaderOptions: {
        babelOptions: {
          // @ts-expect-error "plugins" should be an array, an object is passed to test schema
          plugins: {},
        },
      },
    });
    // Asserts errors in loader functionality
    testFixture('aot/error-syntax');
  });
});
