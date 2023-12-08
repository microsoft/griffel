import {
  compareSnapshots,
  configureYarn,
  copyAssets,
  createTempDir,
  installPackages,
  packLocalPackage,
  sh,
} from '@griffel/e2e-utils';
import * as fs from 'fs';
import * as logSymbols from 'log-symbols';
import * as path from 'path';

async function performTest() {
  const rootDir = path.resolve(__dirname, '..', '..', '..');

  let tempDir: string;

  try {
    tempDir = createTempDir('nextjs');

    await copyAssets({ assetsPath: path.resolve(__dirname, 'assets'), tempDir });
    await configureYarn({ tempDir, rootDir });

    const resolutions = await Promise.all([
      packLocalPackage(rootDir, tempDir, '@griffel/style-types'),
      packLocalPackage(rootDir, tempDir, '@griffel/core'),
      packLocalPackage(rootDir, tempDir, '@griffel/react'),
      packLocalPackage(rootDir, tempDir, '@griffel/tag-processor'),
      packLocalPackage(rootDir, tempDir, '@griffel/webpack-extraction-plugin'),
      packLocalPackage(rootDir, tempDir, '@griffel/webpack-loader'),
      packLocalPackage(rootDir, tempDir, '@griffel/next-extraction-plugin'),
    ]);

    const nextRawVersion = await sh(`yarn next -v`, rootDir, true);
    const nextVersion = nextRawVersion.split('v')[1].trim();

    console.log(logSymbols.info, 'Using Next.js', nextVersion);

    await installPackages({
      packages: ['next', 'react', 'react-dom', 'typescript', '@types/react', '@types/node'],
      resolutions,
      tempDir,
      rootDir,
    });
  } catch (e) {
    console.error(logSymbols.error, 'Something went wrong setting up the test:');
    console.error((e as Error)?.stack ?? e);
    process.exit(1);
  }

  try {
    await sh(`yarn next build`, tempDir);

    console.log(logSymbols.success, `Example project was successfully built with Next.js`);
  } catch (e) {
    console.error(e);

    console.log('');
    console.error(logSymbols.error, `Building a test project Next.js failed.`);

    process.exit(1);
  }

  try {
    const cssFilesPath = path.resolve(tempDir, '.next', 'static', 'css');
    const cssFiles = await fs.promises.readdir(cssFilesPath);

    if (cssFiles.length === 0) {
      throw new Error(`Failed to find CSS files in "${cssFilesPath}"`);
    }

    if (cssFiles.length > 1) {
      throw new Error(`There are CSS files (${cssFiles.length}) than expected in "${cssFilesPath}"`);
    }

    await compareSnapshots({
      type: 'css',
      snapshotFile: path.resolve(__dirname, 'snapshots', 'output.css'),
      resultFile: path.resolve(cssFilesPath, cssFiles[0]),
    });

    console.log(logSymbols.success, `Example project contains the same CSS as a snapshot`);
    console.log('');
    console.log('');
  } catch (e) {
    console.error(e);

    console.log('');
    console.error(logSymbols.error, `Validating CSS produced by Next.js build failed.`);

    process.exit(1);
  }
}

(async () => {
  await performTest();
})();
