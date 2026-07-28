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

// The oldest TypeScript versions `@griffel/style-types` is expected to keep working with.
const TYPESCRIPT_VERSIONS = ['4.4', '4.9', '5.0'];

describe.each(TYPESCRIPT_VERSIONS)('typescript@%s', version => {
  let tempDir: string;
  let tscBin: string;

  beforeAll(async () => {
    tempDir = createTempDir('typescript');

    await copyAssets({
      assetsPath: path.resolve(import.meta.dirname, 'assets'),
      tempDir,
      renames: { 'tsconfig.fixture.json': 'tsconfig.json' },
    });
    await configureYarn({ tempDir, rootDir: ROOT_DIR });

    await installPackages({
      packages: [],
      resolutions: [
        await packLocalPackage(ROOT_DIR, tempDir, '@griffel/style-types'),
        { packageName: 'typescript', version },
      ],
      tempDir,
      rootDir: ROOT_DIR,
    });

    tscBin = path.resolve(tempDir, 'node_modules', 'typescript', 'bin', 'tsc');
  });

  afterAll(() => removeTempDir(tempDir));

  it('installs the requested TypeScript version', async () => {
    const reported = (await sh(`node ${tscBin} --version`, tempDir, true)).replace('Version', '').trim();

    expect(reported).toMatch(new RegExp(`^${version.replace('.', '\\.')}\\.`));
  });

  it('type-checks a project referencing @griffel/style-types', async () => {
    try {
      await sh(`node ${tscBin} --noEmit --pretty`, tempDir, true);
    } catch (e) {
      throw new Error(
        `Building a test project referencing @griffel/style-types using typescript@${version} failed.\n` +
          `This is most likely because you added an API in @griffel/core or a dependency which uses ` +
          `typescript features introduced in a version newer than ${version}.\n\n` +
          (e as Error).message,
      );
    }
  });
});
