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
const SNAPSHOT_FILE = path.resolve(import.meta.dirname, 'snapshot.css');

/** A build of the example project measures ~2s on CI; anything near 30s is a hung bundler. */
const VITE_BUILD_TIMEOUT = 30_000;

const GRIFFEL_PACKAGES = [
  '@griffel/style-types',
  '@griffel/core',
  '@griffel/react',
  '@griffel/transform-shaker',
  '@griffel/transform',
  '@griffel/css-extraction-utils',
  '@griffel/vite-plugin',
];

// `@griffel/transform` embeds the absolute path of resolved assets into the CSS rule before the
// class-name hash is computed, so any rule with a `url()` ends up with a class name that depends on
// the build's absolute temp directory. Redact those class names to a fixed placeholder so the
// snapshot survives across machines and tempdirs.
function redactPathDependentClasses(css: string): string {
  return css.replace(/\.f[a-z0-9]+(?=\s*\{[^}]*\burl\()/g, '.PATH_DEPENDANT_REDACTED');
}

async function readCSSFiles(distDir: string): Promise<string[]> {
  const entries = await fs.promises.readdir(distDir, { recursive: true, withFileTypes: true });

  return entries
    .filter(entry => entry.isFile() && entry.name.endsWith('.css'))
    .map(entry => path.relative(distDir, path.resolve(entry.parentPath, entry.name)))
    .sort();
}

describe('@griffel/vite-plugin', () => {
  let tempDir: string;
  let distDir: string;

  beforeAll(async () => {
    tempDir = createTempDir('vite');
    distDir = path.resolve(tempDir, 'dist');

    await copyAssets({ assetsPath: path.resolve(import.meta.dirname, 'fixture'), tempDir });
    await configureYarn({ tempDir, rootDir: ROOT_DIR });

    const resolutions = await Promise.all(GRIFFEL_PACKAGES.map(pkg => packLocalPackage(ROOT_DIR, tempDir, pkg)));

    await installPackages({
      packages: ['vite', 'react', 'react-dom'],
      resolutions,
      tempDir,
      rootDir: ROOT_DIR,
    });
  });

  afterAll(() => removeTempDir(tempDir));

  it('builds an application', async () => {
    await expect(sh('yarn vite build', tempDir, { timeout: VITE_BUILD_TIMEOUT })).resolves.toBeTypeOf('string');
  });

  // Griffel rules can only be overridden by rules from the same or a later style bucket, so they
  // must not be spread over stylesheets that load in an arbitrary order. The plugin moves them all
  // into the stylesheet of an entrypoint, which for this app means a single emitted CSS file.
  it('emits all Griffel rules into a single stylesheet', async () => {
    await expect(readCSSFiles(distDir)).resolves.toHaveLength(1);
  });

  it('emits CSS matching the snapshot', async () => {
    const [cssFile] = await readCSSFiles(distDir);

    const contents = await fs.promises.readFile(path.resolve(distDir, cssFile), 'utf8');
    const formatted = (await prettier.format(contents, { parser: 'css' })).trim();

    // `toMatchFileSnapshot` compares against the raw file contents, so the trailing newline every
    // text file ends with has to be part of the value being asserted.
    await expect(redactPathDependentClasses(formatted) + '\n').toMatchFileSnapshot(SNAPSHOT_FILE);
  });
});
