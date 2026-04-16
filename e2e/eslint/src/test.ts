import { configureYarn, copyAssets, createTempDir, installPackages, packLocalPackage, sh } from '@griffel/e2e-utils';
import logSymbols from 'log-symbols';
import path from 'path';

async function performTest() {
  let tempDir: string;

  try {
    const rootDir = path.resolve(import.meta.dirname, '..', '..', '..');
    const assetsPath = path.resolve(import.meta.dirname, 'assets');

    tempDir = createTempDir('eslint');

    await copyAssets({ assetsPath, tempDir });
    await configureYarn({ tempDir, rootDir });

    const resolutions = [
      await packLocalPackage(rootDir, tempDir, '@griffel/eslint-plugin'),
      await packLocalPackage(rootDir, tempDir, '@griffel/react'),
    ];

    await installPackages({
      packages: ['eslint', 'typescript-eslint', 'typescript'],
      resolutions,
      tempDir,
      rootDir,
    });
  } catch (e) {
    console.error(logSymbols.error, 'Something went wrong setting up the test:');
    console.error((e as Error)?.stack ?? e);
    process.exit(1);
  }

  // ESLint should exit with code 1 because fixture.ts has a hook-naming violation
  try {
    await sh('npx eslint .', tempDir, true);

    // If we get here, ESLint exited with code 0 (no errors found) — that's a failure
    console.error(
      logSymbols.error,
      'ESLint should have reported an error for the hook-naming violation, but it did not.',
    );
    process.exit(1);
  } catch (e) {
    const output = (e as Error).message;

    if (output.includes('@griffel/hook-naming')) {
      console.log(logSymbols.success, 'ESLint with flat config correctly reported @griffel/hook-naming violation');
    } else {
      console.error(logSymbols.error, 'ESLint failed but not with the expected @griffel/hook-naming error:');
      console.error(output);
      process.exit(1);
    }
  }
}

performTest();
