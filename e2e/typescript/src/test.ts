import { configureYarn, copyAssets, createTempDir, installPackages, packLocalPackage, sh } from '@griffel/e2e-utils';
import * as logSymbols from 'log-symbols';
import * as path from 'path';

async function performTest(tsVersion: string) {
  let tempDir: string;
  let tscBin: string;

  try {
    const rootDir = path.resolve(__dirname, '..', '..', '..');

    tempDir = createTempDir('typescript');

    await copyAssets({
      assetsPath: path.resolve(__dirname, 'assets'),
      tempDir,
      renames: { 'tsconfig.fixture.json': 'tsconfig.json' },
    });
    await configureYarn({ tempDir, rootDir });

    const resolutions = [
      await packLocalPackage(rootDir, tempDir, '@griffel/core'),
      { packageName: 'typescript', version: tsVersion },
    ];

    await installPackages({
      packages: [],
      resolutions,
      tempDir,
      rootDir,
    });

    tscBin = path.resolve(tempDir, 'node_modules', 'typescript', 'bin', 'tsc');
    console.log(
      logSymbols.info,
      'Using TypeScript',
      (await sh(`${tscBin} --version`, tempDir, true)).replace('Version', '').trim(),
    );
  } catch (e) {
    console.error(logSymbols.error, 'Something went wrong setting up the test:');
    console.error((e as Error)?.stack ?? e);
    process.exit(1);
  }

  try {
    await sh(`${tscBin} --noEmit --pretty`, tempDir);

    console.log(logSymbols.success, `Example project was successfully built with typescript@${tsVersion}`);
    console.log('');
    console.log('');
  } catch (e) {
    console.error(e);

    console.log('');
    console.error(
      logSymbols.error,
      `Building a test project referencing @griffel/core using typescript@${tsVersion} failed.`,
    );
    console.error(
      `This is most likely because you added an API in @griffel/core or a dependency which uses ` +
        `typescript features introduced in a version newer than ${tsVersion} (see logs above for the exact error).`,
    );
    process.exit(1);
  }
}

(async () => {
  await performTest('3.9');
  await performTest('4.1');
  await performTest('4.4');
})();
