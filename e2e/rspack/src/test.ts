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

// `@griffel/transform` (used by the modern plugin) embeds the absolute path of resolved assets
// into the CSS rule before the class-name hash is computed, so any rule with a `url()` ends up
// with a class name that depends on the build's absolute temp directory. The `url()` filename
// itself is content-hashed by the bundler and remains stable. Redact the unstable class names
// to a fixed placeholder so the snapshot survives across machines and tempdirs.
function redactPathDependentClasses(css: string): string {
  return css.replace(/\.f[a-z0-9]+(?=\s*\{[^}]*\burl\()/g, '.PATH_DEPENDANT_REDACTED');
}

type Scenario = {
  name: string;
  rspackVersion?: string;
  griffelPackages: string[];
  npmPackages?: string[];
  npmResolutions?: Record<string, string>;
  snapshotFile: string;
};

// `@linaria/shaker` (used by `@griffel/babel-preset`) passes the `useESModules` option to
// `@babel/plugin-transform-runtime`, which was removed in Babel 8. Pin the Babel runtime helpers to
// v7 in the legacy scenarios so a fresh install doesn't pull in an incompatible Babel 8. See #993.
const LEGACY_BABEL_RESOLUTIONS: Record<string, string> = {
  '@babel/plugin-transform-runtime': '^7.0.0',
  '@babel/runtime': '^7.0.0',
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
    npmResolutions: LEGACY_BABEL_RESOLUTIONS,
    snapshotFile: 'legacy-rspack-1.css',
  },
  {
    name: 'legacy-css-extract-rspack-1',
    rspackVersion: '1.7.11',
    griffelPackages: [
      '@griffel/style-types',
      '@griffel/core',
      '@griffel/react',
      '@griffel/babel-preset',
      '@griffel/webpack-extraction-plugin',
      '@griffel/webpack-loader',
    ],
    npmPackages: ['css-loader'],
    npmResolutions: LEGACY_BABEL_RESOLUTIONS,
    snapshotFile: 'legacy-css-extract-rspack-1.css',
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
    npmResolutions: LEGACY_BABEL_RESOLUTIONS,
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
      packages: [...rspackPackages, 'react', 'react-dom', ...(scenario.npmPackages ?? [])],
      resolutions,
      npmResolutions: scenario.npmResolutions,
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

    const cssFilename = distFiles.find(filename => filename.endsWith('.css') && filename.includes('griffel'));

    if (!cssFilename) {
      throw new Error(`Failed to find any matching CSS file in "${distDir}"`);
    }

    await compareSnapshots({
      type: 'css',
      snapshotFile: path.resolve(import.meta.dirname, 'snapshots', scenario.snapshotFile),
      resultFile: path.resolve(distDir, cssFilename),
      update: process.env['UPDATE_SNAPSHOTS'] === '1',
      normalize: redactPathDependentClasses,
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

  const filter = process.env['SCENARIO']
    ?.split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const scenariosToRun = filter?.length ? SCENARIOS.filter(s => filter.includes(s.name)) : SCENARIOS;

  if (filter?.length) {
    const missing = filter.filter(name => !SCENARIOS.some(s => s.name === name));
    if (missing.length) {
      console.error('❌', `Unknown scenario(s): ${missing.join(', ')}`);
      console.error('   Known: ' + SCENARIOS.map(s => s.name).join(', '));
      process.exit(1);
    }
  }

  for (const scenario of scenariosToRun) {
    await runScenario(scenario, rootDir);
  }
}

(async () => {
  await performTest();
})();
