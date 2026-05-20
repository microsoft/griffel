import {
  compareSnapshots,
  configureYarn,
  copyAssets,
  createTempDir,
  installPackages,
  packLocalPackage,
  sh,
} from '@griffel/e2e-utils';
import fs from 'fs';
import path from 'path';

type Scenario = {
  name: string;
  rspackVersion?: string;
  griffelPackages: string[];
  snapshotFile: string;
};

const SCENARIOS: Scenario[] = [
  {
    name: 'legacy-rspack-1',
    rspackVersion: '1.7.11',
    griffelPackages: [
      '@griffel/style-types',
      '@griffel/core',
      '@griffel/react',
      '@griffel/babel-preset',
      '@griffel/webpack-extraction-plugin',
      '@griffel/webpack-loader',
    ],
    snapshotFile: 'legacy-rspack-1.css',
  },
  {
    name: 'legacy-rspack-2',
    griffelPackages: [
      '@griffel/style-types',
      '@griffel/core',
      '@griffel/react',
      '@griffel/babel-preset',
      '@griffel/webpack-extraction-plugin',
      '@griffel/webpack-loader',
    ],
    snapshotFile: 'legacy-rspack-2.css',
  },
  {
    name: 'modern-rspack-2',
    griffelPackages: [
      '@griffel/style-types',
      '@griffel/core',
      '@griffel/react',
      '@griffel/transform-shaker',
      '@griffel/transform',
      '@griffel/webpack-plugin',
    ],
    snapshotFile: 'modern-rspack-2.css',
  },
];

async function runScenario(scenario: Scenario, rootDir: string): Promise<void> {
  console.log('');
  console.log('▶️', `Running scenario "${scenario.name}" (Rspack ${scenario.rspackVersion ?? 'workspace'})`);

  let tempDir: string;

  try {
    tempDir = createTempDir(scenario.name);

    await copyAssets({
      assetsPath: path.resolve(import.meta.dirname, 'shared'),
      tempDir,
    });
    await copyAssets({
      assetsPath: path.resolve(import.meta.dirname, 'scenarios', scenario.name),
      tempDir,
    });
    await configureYarn({ tempDir, rootDir });

    const resolutions = await Promise.all(scenario.griffelPackages.map(pkg => packLocalPackage(rootDir, tempDir, pkg)));

    const rspackPackages: (string | [name: string, version: string])[] = scenario.rspackVersion
      ? [
          ['@rspack/cli', scenario.rspackVersion],
          ['@rspack/core', scenario.rspackVersion],
        ]
      : ['@rspack/cli', '@rspack/core'];

    console.log('ℹ️', `[${scenario.name}] Installing packages...`);

    await installPackages({
      packages: [...rspackPackages, 'react', 'react-dom'],
      resolutions,
      tempDir,
      rootDir,
    });
  } catch (e) {
    console.error('❌', `[${scenario.name}] Setup failed:`);
    console.error((e as Error)?.stack ?? e);
    process.exit(1);
  }

  try {
    await sh(`yarn rspack`, tempDir);

    console.log('✅', `[${scenario.name}] Example project was successfully built with Rspack`);
  } catch (e) {
    console.error(e);

    console.log('');
    console.error('❌', `[${scenario.name}] Building a test project with Rspack failed.`);

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
      snapshotFile: path.resolve(import.meta.dirname, 'snapshots', scenario.snapshotFile),
      resultFile: path.resolve(distDir, cssFilename),
      update: process.env['UPDATE_SNAPSHOTS'] === '1',
    });

    console.log('✅', `[${scenario.name}] Example project contains the same CSS as a snapshot`);
  } catch (e) {
    console.error(e);

    console.log('');
    console.error('❌', `[${scenario.name}] Validating CSS produced by Rspack build failed.`);

    process.exit(1);
  }
}

async function performTest() {
  const rootDir = path.resolve(import.meta.dirname, '..', '..', '..');

  for (const scenario of SCENARIOS) {
    await runScenario(scenario, rootDir);
  }
}

(async () => {
  await performTest();
})();
