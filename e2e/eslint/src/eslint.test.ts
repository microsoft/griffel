import {
  configureYarn,
  copyAssets,
  createTempDir,
  installPackages,
  packLocalPackage,
  removeTempDir,
  sh,
} from '@griffel/e2e-utils';
import path from 'path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const ROOT_DIR = path.resolve(import.meta.dirname, '..', '..', '..');

describe('@griffel/eslint-plugin with a flat config', () => {
  let tempDir: string;

  beforeAll(async () => {
    tempDir = createTempDir('eslint');

    await copyAssets({ assetsPath: path.resolve(import.meta.dirname, 'assets'), tempDir });
    await configureYarn({ tempDir, rootDir: ROOT_DIR });

    const resolutions = [
      await packLocalPackage(ROOT_DIR, tempDir, '@griffel/eslint-plugin'),
      await packLocalPackage(ROOT_DIR, tempDir, '@griffel/react'),
    ];

    await installPackages({
      packages: ['eslint', 'typescript-eslint', 'typescript'],
      resolutions,
      tempDir,
      rootDir: ROOT_DIR,
    });
  });

  afterAll(() => removeTempDir(tempDir));

  // `assets/fixture.ts` deliberately breaks the rule, so ESLint has to exit with a non-zero code
  // *and* the reported problem has to be the Griffel one.
  it('reports a "@griffel/hook-naming" violation', async () => {
    await expect(sh('npx eslint .', tempDir, true)).rejects.toThrow('@griffel/hook-naming');
  });
});
