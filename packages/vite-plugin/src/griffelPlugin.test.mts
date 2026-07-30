import * as prettier from 'prettier';
import { build, type InlineConfig } from 'vite';
import { describe, expect, it, vi } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';

import { griffel, type GriffelPluginOptions } from './griffelPlugin.mjs';

type TestOptions = {
  only?: boolean;

  pluginOptions?: GriffelPluginOptions;
  buildConfig?: InlineConfig;
};

type BuildResult = {
  cssOutput: string;
  filesList: string[];
};

type OutputFile = {
  fileName: string;
  type: 'asset' | 'chunk';
  source?: string | Uint8Array;
};

function getOutputFiles(result: Awaited<ReturnType<typeof build>>): OutputFile[] {
  const outputs = Array.isArray(result) ? result : [result];

  if (!('output' in outputs[0])) {
    throw new Error('"build()" returned a watcher, this is not expected in tests...');
  }

  return outputs[0].output as unknown as OutputFile[];
}

function getFileContents(file: OutputFile | undefined): string {
  if (!file || typeof file.source === 'undefined') {
    return '';
  }

  return typeof file.source === 'string' ? file.source : Buffer.from(file.source).toString('utf-8');
}

const prettierConfig = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../../../.prettierrc'), { encoding: 'utf-8' }),
);

function mergeConfigs(base: InlineConfig, override: InlineConfig | undefined): InlineConfig {
  if (!override) {
    return base;
  }

  return {
    ...base,
    ...override,
    build: { ...base.build, ...override.build },
  };
}

async function compileFixtureWithVite(fixturePath: string, options: TestOptions): Promise<BuildResult> {
  const config: InlineConfig = {
    root: fixturePath,
    configFile: false,
    logLevel: 'silent',

    plugins: [griffel(options.pluginOptions)],

    build: {
      write: false,
      minify: false,
      target: 'esnext',

      rollupOptions: {
        input: path.resolve(fixturePath, 'code.ts'),
        // "@griffel/react" is not a part of a bundle, transformed calls only reference its runtime
        external: ['@griffel/react'],
        // Without it exports of an entrypoint are tree shaken, including dynamic imports
        preserveEntrySignatures: 'strict',
        output: {
          entryFileNames: '[name].js',
          chunkFileNames: '[name].js',
          assetFileNames: '[name][extname]',
        },
      },
    },
  };

  const files = getOutputFiles(await build(mergeConfigs(config, options.buildConfig)));
  const filesList = files.map(file => file.fileName).sort();

  const cssOutput = files
    .filter(file => file.type === 'asset' && file.fileName.endsWith('.css'))
    .sort((a, b) => a.fileName.localeCompare(b.fileName))
    .map(file => `\n/** ${file.fileName} **/\n${getFileContents(file)}`)
    .join('');

  return { cssOutput, filesList };
}

function fixLineEndings(value: string): string {
  return String(value).replace(/\r?\n/g, '\n').trim();
}

/**
 * Normalizes Griffel-generated class name hashes in a string.
 *
 * Asset paths are resolved to absolute paths during transform, which causes class name hashes to differ across
 * machines. This replaces all hashes with deterministic ordered placeholders so comparisons are machine-independent.
 */
function normalizeGriffelHashes(value: string): string {
  const hashRegex = /(?<=[.'"])([fr][a-z0-9]{4,})(?=[{:\s'",[\]])/g;
  const hashes: string[] = [];

  let match = hashRegex.exec(value);

  while (match !== null) {
    if (!hashes.includes(match[1])) {
      hashes.push(match[1]);
    }

    match = hashRegex.exec(value);
  }

  let result = value;

  for (let i = 0; i < hashes.length; i++) {
    const hash = hashes[i];
    const placeholder = `${hash[0]}___${i}`;

    result = result.split(hash).join(placeholder);
  }

  return result;
}

function testFixture(fixtureName: string, options: TestOptions = {}) {
  (options.only ? it.only : it)(
    `"${fixtureName}" fixture`,
    async () => {
      const fixturePath = path.resolve(__dirname, '..', '__fixtures__', fixtureName);
      const cssOutputPath = path.resolve(fixturePath, 'output.css');

      const result = await compileFixtureWithVite(fixturePath, options);
      const resultCSS = fixLineEndings(await prettier.format(result.cssOutput, { ...prettierConfig, parser: 'css' }));

      if (!fs.existsSync(cssOutputPath)) {
        throw new Error(`Failed to find "output.css" in "${fixturePath}"`);
      }

      const expectedCSS = fixLineEndings(await fs.promises.readFile(cssOutputPath, { encoding: 'utf-8' }));

      expect(normalizeGriffelHashes(resultCSS)).toBe(normalizeGriffelHashes(expectedCSS));
    },
    30000,
  );
}

describe('griffel() [build]', () => {
  // Basic assertions
  // --------------------
  testFixture('basic-rules');
  testFixture('reset');
  testFixture('mixed');
  testFixture('static-styles');

  // Ensures that a file without makeStyles() calls remains unprocessed
  testFixture('missing-calls');

  // Sorting rules by buckets
  testFixture('style-buckets');

  // Assets
  // --------------------
  testFixture('assets');

  // Compatibility
  // --------------------

  // With existing CSS
  testFixture('with-css');

  // Chunks
  // --------------------
  testFixture('with-chunks');

  it('moves CSS of all chunks to an asset of an entrypoint', async () => {
    const fixturePath = path.resolve(__dirname, '..', '__fixtures__', 'with-chunks');
    const result = await compileFixtureWithVite(fixturePath, {});

    const cssFiles = result.filesList.filter(fileName => fileName.endsWith('.css'));

    expect(cssFiles).toEqual(['chunkA.css', 'chunkB.css', 'code.css']);
    // CSS from lazy chunks is moved to the entry asset, otherwise the order of Griffel rules is not guaranteed
    expect(result.cssOutput).toMatch(
      /\/\*\* code\.css \*\*\/\s*\.\w+\{background-color:\s?green;\}\.\w+\{color:\s?red;\}/,
    );
    // CSS that is not produced by Griffel stays in the assets of lazy chunks
    expect(result.cssOutput).toMatch(/\/\*\* chunkA\.css \*\*\/\s*\.foo\{color:\s?red;\}/);
  }, 30000);

  it('merges CSS into a single asset when "cssCodeSplit" is disabled', async () => {
    const fixturePath = path.resolve(__dirname, '..', '__fixtures__', 'with-chunks');
    const result = await compileFixtureWithVite(fixturePath, {
      buildConfig: { build: { cssCodeSplit: false } },
    });

    expect(result.filesList.filter(fileName => fileName.endsWith('.css'))).toEqual(['style.css']);
    expect(result.cssOutput).toMatch(/\.\w+\{background-color:\s?green;\}\.\w+\{color:\s?red;\}/);
  }, 30000);

  it('respects "compareMediaQueries"', async () => {
    const fixturePath = path.resolve(__dirname, '..', '__fixtures__', 'media-queries');
    const defaultResult = await compileFixtureWithVite(fixturePath, {});
    const reversedResult = await compileFixtureWithVite(fixturePath, {
      pluginOptions: {
        compareMediaQueries: (a, b) => b.localeCompare(a),
      },
    });

    expect(defaultResult.cssOutput.indexOf('min-width: 100px')).toBeLessThan(
      defaultResult.cssOutput.indexOf('min-width: 900px'),
    );
    expect(reversedResult.cssOutput.indexOf('min-width: 900px')).toBeLessThan(
      reversedResult.cssOutput.indexOf('min-width: 100px'),
    );
  }, 30000);

  it('deduplicates rules that are used in multiple files', async () => {
    const fixturePath = path.resolve(__dirname, '..', '__fixtures__', 'rules-deduplication');
    const result = await compileFixtureWithVite(fixturePath, {});

    expect(result.cssOutput.match(/color:\s?red/g)).toHaveLength(1);
  }, 30000);

  it('keeps a stylesheet of an HTML entrypoint linked', async () => {
    const fixturePath = path.resolve(__dirname, '..', '__fixtures__', 'html-entry');
    const result = await build({
      root: fixturePath,
      configFile: false,
      logLevel: 'silent',

      plugins: [griffel()],

      build: {
        write: false,
        minify: false,
        target: 'esnext',

        rollupOptions: {
          external: ['@griffel/react'],
          output: { assetFileNames: '[name][extname]' },
        },
      },
    });
    const files = getOutputFiles(result);

    const html = files.find(file => file.fileName === 'index.html');
    const css = files.find(file => file.fileName.endsWith('.css'));

    expect(getFileContents(html)).toContain(`<link rel="stylesheet" crossorigin href="/${css?.fileName}">`);

    // The CSS of an application goes first, Griffel rules are appended & sorted by buckets
    expect(getFileContents(css)).toMatch(
      /\.app\{color:\s?black;\}\.\w+\{color:\s?red;\}\.\w+\{display:\s?flex;\}@media \(min-width: 100px\)/,
    );
  }, 30000);

  it('prints stats & perf issues when enabled', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const fixturePath = path.resolve(__dirname, '..', '__fixtures__', 'basic-rules');

    try {
      await compileFixtureWithVite(fixturePath, {
        pluginOptions: { collectStats: true, collectPerfIssues: true },
      });

      const output = consoleSpy.mock.calls.map(call => String(call[0])).join('\n');

      expect(output).toContain('[Griffel] 1 files processed');
      expect(output).toContain('[Griffel] Transform:');
      expect(output).toContain('[Griffel] Extraction:');
    } finally {
      consoleSpy.mockRestore();
    }
  }, 30000);

  it('does not transform files excluded by "exclude"', async () => {
    const fixturePath = path.resolve(__dirname, '..', '__fixtures__', 'basic-rules');
    const result = await compileFixtureWithVite(fixturePath, {
      pluginOptions: { exclude: /code\.ts$/ },
    });

    expect(result.cssOutput).toBe('');
    expect(result.filesList).toEqual(['code.js']);
  }, 30000);
});
