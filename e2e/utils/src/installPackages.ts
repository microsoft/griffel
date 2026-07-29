import fs from 'fs';
import path from 'path';

import { sh } from './sh.ts';

/**
 * Registry metadata for a handful of packages, resolved against the repository's own lockfile.
 */
const YARN_INFO_TIMEOUT = 60_000;

/**
 * The only genuinely slow command in a scenario's setup: a full resolution and download of React,
 * a bundler and the Babel toolchain with no lockfile to short-circuit it.
 *
 * It takes seconds with a warm Yarn cache, but CI runs several of these suites concurrently
 * (`NX_PARALLEL`) against a cache that starts empty, and installs then contend for the runner's
 * network, disk and CPU — a scenario measured at ~4s locally has taken over 120s there. The budget
 * is deliberately far above the worst observed run: it is here to catch an install that is *stuck*,
 * not one that is merely slow, because being killed early is what turned a slow install into a
 * failed suite.
 */
const YARN_INSTALL_TIMEOUT = 300_000;

export async function installPackages(options: {
  packages: (string | [name: string, version: string])[];
  resolutions: { file?: string; version?: string; packageName: string }[];
  npmResolutions?: Record<string, string>;
  rootDir: string;
  tempDir: string;
}) {
  const { tempDir, packages, resolutions, npmResolutions, rootDir } = options;

  const packageJsonPath = path.resolve(tempDir + '/package.json');
  const packageJsonPathExists = !!(await fs.promises.stat(packageJsonPath).catch(() => false));

  if (!packageJsonPathExists) {
    throw new Error(`A "package.json" in a temporary directory does not exist`);
  }

  let packagesWithVersions: Record<string, string> = {};

  const workspacePackages: string[] = [];
  const versionedPackages: Record<string, string> = {};

  for (const pkg of packages) {
    if (Array.isArray(pkg)) {
      versionedPackages[pkg[0]] = pkg[1];
    } else {
      workspacePackages.push(pkg);
    }
  }

  if (workspacePackages.length > 0) {
    const yarnOutput = await sh(`yarn info ${workspacePackages.join(' ')} --json`, rootDir, {
      pipeOutputToResult: true,
      timeout: YARN_INFO_TIMEOUT,
    });
    const parsedYarnOutput = yarnOutput
      .split('\n')
      .filter(Boolean)
      .map(line => JSON.parse(line));

    packagesWithVersions = Object.fromEntries(
      parsedYarnOutput.map(info => [info.value.split('@patch')[0].split('@npm')[0], info.children.Version]),
    );
  }

  packagesWithVersions = { ...packagesWithVersions, ...versionedPackages };

  const packageJson = JSON.parse(await fs.promises.readFile(tempDir + '/package.json', 'utf8'));
  const newPackageJson = {
    ...packageJson,
    sideEffects: false,
    dependencies: {
      ...Object.fromEntries(resolutions.map(pkg => [pkg.packageName, '*'])),
      ...packagesWithVersions,
    },
    resolutions: {
      ...Object.fromEntries(resolutions.map(pkg => [pkg.packageName, pkg.version || `./${pkg.file}`])),
      ...npmResolutions,
    },
  };

  await fs.promises.writeFile(packageJsonPath, JSON.stringify(newPackageJson, null, 2));
  await sh('yarn install', tempDir, { pipeOutputToResult: true, timeout: YARN_INSTALL_TIMEOUT });

  console.log('✅', 'Packages were installed');
}
