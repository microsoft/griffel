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
    tempDir = createTempDir('rspack');

    await copyAssets({ assetsPath: path.resolve(__dirname, 'assets'), tempDir });
    await configureYarn({ tempDir, rootDir });

    const resolutions = await Promise.all([
      packLocalPackage(rootDir, tempDir, '@griffel/style-types'),
      packLocalPackage(rootDir, tempDir, '@griffel/core'),
      packLocalPackage(rootDir, tempDir, '@griffel/react'),
      packLocalPackage(rootDir, tempDir, '@griffel/webpack-extraction-plugin'),
      packLocalPackage(rootDir, tempDir, '@griffel/webpack-loader'),
    ]);

    const rspackVersion = (await sh(`yarn rspack --version`, rootDir, true)).trim();

    console.log(logSymbols.info, 'Using Rspack', rspackVersion);
    console.log(logSymbols.info, 'Installing packages...');

    await installPackages({
      packages: ['@rspack/cli', 'react', 'react-dom'],
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
    await sh(`yarn rspack`, tempDir);

    console.log(logSymbols.success, `Example project was successfully built with Rspack`);
  } catch (e) {
    console.error(e);

    console.log('');
    console.error(logSymbols.error, `Building a test project with Rspack failed.`);

    process.exit(1);
  }

  try {
    const distDir = path.resolve(tempDir, 'dist');
    const distFiles = await fs.promises.readdir(distDir);

    const cssFilename = distFiles.find(filename => filename.endsWith('griffel.css'));

    if (!cssFilename) {
      throw new Error(`Failed to find any matching CSS file in "${distDir}"`);
    }

    await compareSnapshots({
      type: 'css',
      snapshotFile: path.resolve(__dirname, 'snapshots', 'output.css'),
      resultFile: path.resolve(distDir, cssFilename),
    });

    console.log(logSymbols.success, `Example project contains the same CSS as a snapshot`);
    console.log('');
    console.log('');
  } catch (e) {
    console.error(e);

    console.log('');
    console.error(logSymbols.error, `Validating CSS produced by Rspack build failed.`);

    process.exit(1);
  }
}

(async () => {
  await performTest();
})();
