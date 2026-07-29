import path from 'path';
import fs from 'fs';

import { sh } from './sh.ts';

/** Repacking an already built package is local work over a directory that is a few megabytes. */
const NPM_PACK_TIMEOUT = 60_000;

export async function packLocalPackage(rootDir: string, tempDir: string, packageName: string) {
  const packagePath = path.resolve(rootDir, 'dist', 'packages', packageName.split('/')[1]);
  const packagePathExists = !!(await fs.promises.stat(packagePath).catch(() => false));

  if (!packagePathExists) {
    throw new Error(`A directory with artifacts (${packagePath}) does not exist`);
  }

  // Use `npm pack` because `yarn pack` incorrectly calculates the included files when the
  // files to include/exclude are specified by .npmignore rather than package.json `files`.
  // (--quiet outputs only the .tgz filename, not all the included files)
  const packFile = (
    await sh(`npm pack --quiet ${packagePath}`, tempDir, {
      pipeOutputToResult: true,
      timeout: NPM_PACK_TIMEOUT,
    })
  ).trim();
  console.log('✅', `Package "${packageName}" was packed`);

  return {
    packageName,
    file: packFile,
  };
}
