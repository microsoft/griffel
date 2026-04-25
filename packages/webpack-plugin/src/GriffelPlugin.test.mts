import { createFsFromVolume, Volume } from 'memfs';
import * as prettier from 'prettier';
import { describe, it, expect, vi } from 'vitest';
import type {
  Configuration as WebpackConfiguration,
  Compiler as WebpackCompiler,
  StatsError as WebpackStatsError,
} from 'webpack';
import { merge } from 'webpack-merge';
import * as fs from 'node:fs';
import * as path from 'node:path';

import { createResolverFactory } from './resolver/createResolverFactory.mjs';

await vi.hoisted(mock);

async function mock() {
  const { Module } = await import('module');
  const path = await import('path');

  const mockedUri = path.resolve(__dirname, './webpackLoader.vitest.cjs');
  const mock = await import('./webpackLoader.mjs');

  const loadOriginal = (Module as any)._load;
  (Module as any)._load = (uri: string, parent: string) => {
    if (uri === mockedUri) return mock.default;
    return loadOriginal(uri, parent);
  };
}

import { GriffelPlugin, type GriffelCSSExtractionPluginOptions } from './GriffelPlugin.mjs';
import type { WebpackLoaderOptions } from './webpackLoader.mjs';

type TestOptions = {
  only?: boolean;

  cssFilename?: string;
  loaderOptions?: WebpackLoaderOptions;
  normalizeHashes?: boolean;
  pluginOptions?: GriffelCSSExtractionPluginOptions;
  webpackConfig?: WebpackConfiguration;
  /**
   * When provided, replaces the single `entry` with this multi-entry map.
   * The `entryPath` argument to `compileSourceWithWebpack` is ignored when
   * this is set (but it still determines the include path for the loader rule).
   */
  entryMap?: Record<string, string>;
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
  readAsset: (name: string) => string;
}> {
  // CJS interop for Vite
  const { default: MiniCssExtractPlugin } = (await import('mini-css-extract-plugin')) as unknown as {
    default: typeof import('mini-css-extract-plugin');
  };
  const { default: webpack } = (await import('webpack')) as unknown as {
    default: typeof import('webpack');
  };

  // When entryMap is provided, use it; otherwise use the single entryPath.
  const entryConfig: WebpackConfiguration['entry'] = options.entryMap
    ? Object.fromEntries(Object.entries(options.entryMap).map(([name, p]) => [name, p]))
    : { bundle: entryPath };

  // The loader include path covers the directory of the primary entry (or all
  // entry dirs when a map is provided so shared modules are also transformed).
  const includeDir = options.entryMap
    ? path.dirname(Object.values(options.entryMap)[0])
    : path.dirname(entryPath);

  const defaultConfig: WebpackConfiguration = {
    context: __dirname,
    entry: entryConfig,

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
          include: includeDir,
          use: {
            loader: path.resolve(__dirname, './webpackLoader.vitest.cjs'),
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
      new GriffelPlugin({
        resolverFactory: createResolverFactory(),
        ...options.pluginOptions,
      }),
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

  compiler.outputFileSystem = virtualFsVolume as unknown as NonNullable<WebpackCompiler['outputFileSystem']>;
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

      // When entryMap is provided, any of the entry modules can be the primary.
      const entryModule = options.entryMap
        ? jsonStats.modules.find(module =>
            Object.values(options.entryMap!).some(p => module.nameForCondition === p),
          )
        : jsonStats.modules.find(module => module.nameForCondition === entryPath);

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

      const readAsset = (name: string): string =>
        virtualFsVolume.readFileSync(path.resolve(__dirname, name), { encoding: 'utf-8' }) as string;

      resolve({
        cssOutput,
        filesList,
        moduleSource: entryModule.source as string,
        readAsset,
      });
    });
  });
}

function fixLineEndings(value: string) {
  return String(value).replace(/\r?\n/g, '\n').trim();
}

/**
 * Normalizes Griffel-generated class name hashes in a string.
 * Asset paths are resolved to absolute paths during transform, which causes
 * class name hashes to differ across machines. This replaces all hashes with
 * deterministic ordered placeholders so comparisons are machine-independent.
 *
 * Each string is normalized independently — the first hash encountered becomes
 * `f___0`, the second `f___1`, etc.
 */
function normalizeGriffelHashes(str: string): string {
  const hashRegex = /(?<=[.'"])([fr][a-z0-9]{4,})(?=[{:\s'",[\]])/g;
  const hashes: string[] = [];
  let match;

  while ((match = hashRegex.exec(str)) !== null) {
    if (!hashes.includes(match[1])) {
      hashes.push(match[1]);
    }
  }

  let result = str;

  for (let i = 0; i < hashes.length; i++) {
    const hash = hashes[i];
    const prefix = hash[0];
    const placeholder = `${prefix}___${i}`;

    result = result.split(hash).join(placeholder);
  }

  return result;
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
      const fixturePath = path.resolve(__dirname, '..', '__fixtures__', fixtureName);

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

      let resultError: Error | WebpackStatsError = new Error();

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
          resultError = err as WebpackStatsError;
        } else {
          throw err;
        }
      }

      const fsSnapshot = JSON.parse(await fs.promises.readFile(fsSnapshotPath, { encoding: 'utf8' }));

      if (outputPath) {
        const moduleOutput = fixLineEndings(await fs.promises.readFile(outputPath, { encoding: 'utf8' }));

        if (options.normalizeHashes) {
          expect(normalizeGriffelHashes(resultModule)).toBe(moduleOutput);
        } else {
          expect(resultModule).toBe(moduleOutput);
        }
      }

      if (cssOutputPath) {
        const cssOutput = fixLineEndings(await fs.promises.readFile(cssOutputPath, { encoding: 'utf8' }));

        if (options.normalizeHashes) {
          expect(normalizeGriffelHashes(resultCSS)).toBe(cssOutput);
        } else {
          expect(resultCSS).toBe(cssOutput);
        }
      }

      if (expectedError) {
        expect(resultError.message).toMatch(expectedError.default);
      }

      expect(resultFsSnapshot).toMatchObject(fsSnapshot);
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
  testFixture('mixed-vm');
  testFixture('empty');

  // Ensures that a file without makeStyles() calls remains unprocessed
  testFixture('missing-calls');

  // Multiple calls of __styles
  testFixture('multiple');

  // Deduplicate rules in stylesheet
  testFixture('rules-deduplication');

  // Sorting rules by buckets
  testFixture('style-buckets');

  // Assets
  // --------------------
  testFixture('assets', { normalizeHashes: true });
  testFixture('assets-flip', { normalizeHashes: true });
  testFixture('assets-multiple', { normalizeHashes: true });
  testFixture('reset-assets', { normalizeHashes: true });

  // Config
  // --------------------

  // Custom filenames in mini-css-extract-plugin
  testFixture('config-name', { cssFilename: '[name].[contenthash].css' });

  // Custom classNameHashSalt
  testFixture('config-classname-hash-salt', {
    loaderOptions: {
      classNameHashSalt: 'prefix',
    },
  });

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
        bundleB: path.resolve(__dirname, '..', '__fixtures__', 'unstable-attach-to-main', 'codeB.ts'),
      },
    },
  });

  // unstable_layeredOutput
  // --------------------
  describe('unstable_layeredOutput', () => {
    const layeredFixtureDir = path.resolve(__dirname, '..', '__fixtures__', 'layered-multi-entry');
    const pageAPath = path.resolve(layeredFixtureDir, 'page-a.ts');
    const pageBPath = path.resolve(layeredFixtureDir, 'page-b.ts');

    it(
      'emits a layer manifest, wraps rules in @layer, and assigns indexed media-query layers across chunks',
      async () => {
        const { filesList, readAsset } = await compileSourceWithWebpack(pageAPath, {
          entryMap: { 'page-a': pageAPath, 'page-b': pageBPath },
          pluginOptions: { unstable_layeredOutput: true },
          webpackConfig: {
            optimization: {
              splitChunks: {
                chunks: 'all',
                minSize: 0,
              },
            },
          },
        });

        // 1. More than one .css asset must be emitted (split chunks).
        const cssFiles = filesList.filter(f => f.endsWith('.css'));
        expect(cssFiles.length).toBeGreaterThan(1);

        // 2. Every emitted CSS asset starts with the @layer manifest and
        //    mentions every bucket layer.
        const manifestRe = /^@layer\s+griffel\.r,/;
        for (const cssFile of cssFiles) {
          const css = readAsset(cssFile);
          expect(css).toMatch(manifestRe);
          // Check all static buckets plus the media query bucket (fixture has media queries).
          // The 'c' bucket is omitted here because container query metadata is not
          // emitted by @griffel/core yet — it would only appear dynamically if 'c'
          // metadata were set.
          for (const bucket of ['r', 'd', 'l', 'v', 'w', 'f', 'i', 'h', 'a', 's', 'k', 't', 'm']) {
            expect(css).toContain(`griffel.${bucket}`);
          }
        }

        // 3. No placeholder must remain.
        for (const cssFile of cssFiles) {
          const css = readAsset(cssFile);
          expect(css).not.toMatch(/__griffelmq_/);
          expect(css).not.toMatch(/__griffelcq_/);
        }

        // 4. The two media queries must appear as ordered by defaultCompareMediaQueries
        //    (lexicographic). '(min-width: 1200px)' < '(min-width: 800px)' so 1200px → q0.
        const allCss = cssFiles.map(f => readAsset(f)).join('\n');
        expect(allCss).toMatch(/@layer griffel\.m\.q0\s*\{[^}]*@media \(min-width: 1200px\)/s);
        expect(allCss).toMatch(/@layer griffel\.m\.q1\s*\{[^}]*@media \(min-width: 800px\)/s);
      },
      30000,
    );

    it(
      'does not emit @layer wrappers when the flag is off (default behavior preserved)',
      async () => {
        const { filesList, readAsset } = await compileSourceWithWebpack(pageAPath, {
          entryMap: { 'page-a': pageAPath, 'page-b': pageBPath },
          webpackConfig: {
            optimization: {
              splitChunks: {
                chunks: 'all',
                minSize: 0,
              },
            },
          },
        });

        // Default mode: a single griffel.css is emitted.
        const cssFiles = filesList.filter(f => f.endsWith('.css'));
        expect(cssFiles).toEqual(['griffel.css']);
        const css = readAsset('griffel.css');
        expect(css).not.toContain('@layer ');
      },
      30000,
    );

    it('throws when combined with unstable_attachToEntryPoint', () => {
      expect(
        () =>
          new GriffelPlugin({
            unstable_layeredOutput: true,
            unstable_attachToEntryPoint: 'main',
          }),
      ).toThrow(/unstable_layeredOutput.*unstable_attachToEntryPoint/);
    });
  });

  // Error reporting
  // --------------------
  it(
    'includes the offending filename in VM evaluation errors',
    async () => {
      const fixturePath = path.resolve(__dirname, '..', '__fixtures__', 'vm-error-trace');
      const entryPath = path.resolve(fixturePath, 'code.ts');

      // Replace machine-specific paths and line numbers so snapshots are stable across environments
      const repoRoot = path.resolve(__dirname, '../../..');
      const normalize = (s: string) =>
        s.split(repoRoot).join('<repo>').replace(/:\d+(:\d+)?/g, ':<line>');

      let error: WebpackStatsError | undefined;

      try {
        await compileSourceWithWebpack(entryPath, {});
      } catch (e) {
        error = e as WebpackStatsError;
      }

      expect(error).toBeDefined();
      expect(normalize(error!.message)).toMatchInlineSnapshot(`
        "Module build failed (from ./webpackLoader.vitest.cjs):
        <repo>/packages/transform/src/evaluation/module.mts:<line>
              throw hostError;
              ^

        <repo>/packages/webpack-plugin/__fixtures__/vm-error-trace/broken.ts:<line>
        const color = obj.missingProp;
                          ^

        TypeError: Cannot read properties of undefined (reading 'missingProp')
            at <repo>/packages/webpack-plugin/__fixtures__/vm-error-trace/broken.ts:<line>
            at <repo>/packages/webpack-plugin/__fixtures__/vm-error-trace/broken.ts:<line>
            at Script.runInContext (node:vm:<line>)
            at Module.evaluate (<repo>/packages/transform/src/evaluation/module.mts:<line>)
            at require.Object.assign.ensure (<repo>/packages/transform/src/evaluation/module.mts:<line>)
            at <repo>/packages/webpack-plugin/__fixtures__/vm-error-trace/code.ts:<line>
            at <repo>/packages/webpack-plugin/__fixtures__/vm-error-trace/code.ts:<line>
            at Script.runInContext (node:vm:<line>)
            at Module.evaluate (<repo>/packages/transform/src/evaluation/module.mts:<line>)
            at vmEvaluator (<repo>/packages/transform/src/evaluation/vmEvaluator.mts:<line>)"
      `);
    },
    15000,
  );
});
