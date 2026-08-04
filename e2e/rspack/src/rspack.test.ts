import {
  configureYarn,
  copyAssets,
  createTempDir,
  installPackages,
  packLocalPackage,
  removeTempDir,
  sh,
} from '@griffel/e2e-utils';
import fs from 'fs';
import path from 'path';
import prettier from 'prettier';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const ROOT_DIR = path.resolve(import.meta.dirname, '..', '..', '..');
const SNAPSHOTS_DIR = path.resolve(import.meta.dirname, 'snapshots');

/** A build of the example project measures ~1.5s on CI; anything near 15s is a hung bundler. */
const RSPACK_BUILD_TIMEOUT = 15_000;

// `@griffel/transform` (used by the modern plugin) embeds the absolute path of resolved assets
// into the CSS rule before the class-name hash is computed, so any rule with a `url()` ends up
// with a class name that depends on the build's absolute temp directory. The `url()` filename
// itself is content-hashed by the bundler and remains stable. Redact the unstable class names
// to a fixed placeholder so the snapshot survives across machines and tempdirs.
function redactPathDependentClasses(css: string): string {
  return css.replace(/\.f[a-z0-9]+(?=\s*\{[^}]*\burl\()/g, '.PATH_DEPENDANT_REDACTED');
}

async function readEmittedCSS(tempDir: string): Promise<string> {
  const distDir = path.resolve(tempDir, 'dist');
  const distFiles = await fs.promises.readdir(distDir);
  const cssFilename = distFiles.find(filename => filename.endsWith('.css') && filename.includes('griffel'));

  expect(cssFilename, `Failed to find any matching CSS file in "${distDir}"`).toBeDefined();

  const contents = await fs.promises.readFile(path.resolve(distDir, cssFilename as string), 'utf8');
  // Remove meta info added by Rspack
  const cleaned = contents.replace(/head{--webpack-rspack-(\d+)-(\w+)-(\d+):&_(\d+);}/, '');
  const formatted = (await prettier.format(cleaned, { parser: 'css' })).trim();

  // `toMatchFileSnapshot` compares against the raw file contents, so the trailing newline every
  // text file ends with has to be part of the value being asserted.
  return redactPathDependentClasses(formatted) + '\n';
}

type Scenario = {
  name: string;
  rspackVersion?: string;
  griffelPackages: string[];
  npmPackages?: string[];
  snapshotFile: string;
};

const GRIFFEL_PACKAGES = [
  '@griffel/style-types',
  '@griffel/core',
  '@griffel/react',
  '@griffel/transform-shaker',
  '@griffel/transform',
  '@griffel/css-extraction-utils',
  '@griffel/webpack-plugin',
];

const SCENARIOS: Scenario[] = [
  {
    name: 'modern-rspack-1',
    rspackVersion: '1.7.11',
    griffelPackages: GRIFFEL_PACKAGES,
    snapshotFile: 'modern-rspack-1.css',
  },
  {
    name: 'modern-css-extract-rspack-1',
    rspackVersion: '1.7.11',
    griffelPackages: GRIFFEL_PACKAGES,
    npmPackages: ['css-loader'],
    snapshotFile: 'modern-css-extract-rspack-1.css',
  },
  {
    name: 'modern-rspack-2',
    griffelPackages: GRIFFEL_PACKAGES,
    snapshotFile: 'modern-rspack-2.css',
  },
];

describe.each(SCENARIOS)('$name', scenario => {
  let tempDir: string;

  beforeAll(async () => {
    tempDir = createTempDir(scenario.name);

    await copyAssets({ assetsPath: path.resolve(import.meta.dirname, 'shared'), tempDir });
    await copyAssets({ assetsPath: path.resolve(import.meta.dirname, 'scenarios', scenario.name), tempDir });
    await configureYarn({ tempDir, rootDir: ROOT_DIR });

    const resolutions = await Promise.all(
      scenario.griffelPackages.map(pkg => packLocalPackage(ROOT_DIR, tempDir, pkg)),
    );

    const rspackPackages: (string | [name: string, version: string])[] = scenario.rspackVersion
      ? [
          ['@rspack/cli', scenario.rspackVersion],
          ['@rspack/core', scenario.rspackVersion],
        ]
      : ['@rspack/cli', '@rspack/core'];

    await installPackages({
      packages: [...rspackPackages, 'react', 'react-dom', ...(scenario.npmPackages ?? [])],
      resolutions,
      tempDir,
      rootDir: ROOT_DIR,
    });
  });

  afterAll(() => removeTempDir(tempDir));

  it(`builds "${scenario.name}" with Rspack`, async () => {
    await expect(sh('yarn rspack', tempDir, { timeout: RSPACK_BUILD_TIMEOUT })).resolves.toBeTypeOf('string');
  });

  it(`emits CSS matching the "${scenario.snapshotFile}" snapshot`, async () => {
    await expect(await readEmittedCSS(tempDir)).toMatchFileSnapshot(path.resolve(SNAPSHOTS_DIR, scenario.snapshotFile));
  });
});
