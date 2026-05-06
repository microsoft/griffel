import fs from 'fs';
import path from 'path';

import { sh } from './sh.ts';

export async function installPackages(options: {
  packages: (string | [name: string, version: string])[];
  resolutions: { file?: string; version?: string; packageName: string }[];
  rootDir: string;
  tempDir: string;
}) {
  const { tempDir, packages, resolutions, rootDir } = options;

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
    const yarnOutput = await sh(`yarn info ${workspacePackages.join(' ')} --json`, rootDir, true);
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
    dependencies: {
      ...Object.fromEntries(resolutions.map(pkg => [pkg.packageName, '*'])),
      ...packagesWithVersions,
    },
    resolutions: Object.fromEntries(resolutions.map(pkg => [pkg.packageName, pkg.version || `./${pkg.file}`])),
  };

  await fs.promises.writeFile(packageJsonPath, JSON.stringify(newPackageJson, null, 2));
  await sh('yarn install', tempDir, true);

  console.log('✅', 'Packages were installed');
}
