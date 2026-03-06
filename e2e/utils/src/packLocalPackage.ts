import * as path from 'path';
import * as logSymbols from 'log-symbols';

import { sh } from './sh';

export async function packLocalPackage(rootDir: string, tempDir: string, packageName: string) {
  const packagePath = path.resolve(rootDir, 'packages', packageName.split('/')[1]);

  if (!packagePath) {
    throw new Error(`A package directory (${packageName}) does not exist`);
  }

  // Use `npm pack` because `yarn pack` incorrectly calculates the included files when the
  // files to include/exclude are specified by .npmignore rather than package.json `files`.
  // (--quiet outputs only the .tgz filename, not all the included files)
  const packFile = (await sh(`npm pack --quiet ${packagePath}`, tempDir, true)).trim();
  console.log(logSymbols.success, `Package "${packageName}" was packed`);

  return {
    packageName,
    file: packFile,
  };
}
