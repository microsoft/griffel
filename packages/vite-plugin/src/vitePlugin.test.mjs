import moduleAlias from 'module-alias';
import assert from 'node:assert';
import fs from 'node:fs/promises';
import test from 'node:test';
import path from 'node:path';
import url from 'node:url';
import prettier from 'prettier';
import { build } from 'vite';
import vitePlugin from '@wyw-in-js/vite';

const currentDir = url.fileURLToPath(new URL('.', import.meta.url));
const rootDir = path.resolve(currentDir, '..', '..', '..');

const fixturesDir = path.resolve(currentDir, '..', '__fixtures__');

const prettierConfig = JSON.parse(await fs.readFile(path.resolve(rootDir, '.prettierrc'), { encoding: 'utf-8' }));

// TODO: Remove this once we have a better way to resolve aliases in ESM
moduleAlias.addAlias('@griffel/core', path.resolve(rootDir, 'dist', 'packages', 'core'));
moduleAlias.addAlias('@griffel/react', path.resolve(rootDir, 'dist', 'packages', 'react'));
moduleAlias.addAlias(
  '@griffel/tag-processor/make-styles',
  path.resolve(rootDir, 'dist', 'packages', 'tag-processor', 'src', 'MakeStylesProcessor.js'),
);
moduleAlias.addAlias(
  '@griffel/tag-processor/make-reset-styles',
  path.resolve(rootDir, 'dist', 'packages', 'tag-processor', 'src', 'MakeResetStylesProcessor.js'),
);

/**
 * @param {string} fixtureName
 * @param {object} [options]
 * @param {import('vite').AliasOptions} [options.aliases]
 */
async function buildFixture(fixtureName, options = {}) {
  const tmp = await import('tmp');

  // "Unsafe" means delete even if it still has files inside (our desired behavior)
  const tempDir = tmp.dirSync({ prefix: 'vite', unsafeCleanup: true }).name;

  const result = await build({
    resolve: {
      alias: {
        '@griffel/core': path.resolve(rootDir, 'dist', 'packages', 'core'),
        '@griffel/react': path.resolve(rootDir, 'dist', 'packages', 'react'),

        ...options.aliases,
      },
    },

    build: {
      minify: false,
      modulePreload: false,

      outDir: tempDir,
      emptyOutDir: true,

      rollupOptions: {
        external: ['@griffel/react'],
      },
    },

    configFile: false,
    logLevel: 'silent',

    root: path.resolve(fixturesDir, fixtureName),
    plugins: [vitePlugin()],
  });

  const jsAsset = result.output.find(asset => asset.fileName.endsWith('.js'));
  const jsAssetPath = path.resolve(tempDir, jsAsset.fileName);

  const jsAssetContent = prettier.format(await fs.readFile(jsAssetPath, 'utf-8'), {
    parser: 'babel',
    ...prettierConfig,
  });

  const jsFixturePath = path.resolve(fixturesDir, fixtureName, 'output.ts');
  const jsFixtureContent = await fs.readFile(jsFixturePath, 'utf-8');

  return {
    jsAssetContent,
    jsFixtureContent,
  };
}

test('object (fixture)', async () => {
  const { jsAssetContent, jsFixtureContent } = await buildFixture('object');

  assert.strictEqual(jsAssetContent, jsFixtureContent);
});

test('aliases (fixture)', async () => {
  const { jsAssetContent, jsFixtureContent } = await buildFixture('aliases', {
    aliases: {
      'non-existing-color-module': path.resolve(fixturesDir, 'aliases', 'color.ts'),
    },
  });

  assert.strictEqual(jsAssetContent, jsFixtureContent);
});
