import path from 'path';
import fs from 'fs';

import { sh } from './sh.ts';

export async function packLocalPackage(rootDir: string, tempDir: string, packageName: string) {
  const packagePath = path.resolve(rootDir, 'packages', packageName.split('/')[1]);
  const distPath = path.resolve(packagePath, 'dist');
  const distExists = !!(await fs.promises.stat(distPath).catch(() => false));

  if (!distExists) {
    throw new Error(`Build artifacts not found at "${distPath}" — run "nx run ${packageName}:build" first`);
  }

  // Use `npm pack` because `yarn pack` incorrectly calculates the included files when the
  // files to include/exclude are specified by .npmignore rather than package.json `files`.
  // (--quiet outputs only the .tgz filename, not all the included files)
  const packFile = (await sh(`npm pack --quiet ${packagePath}`, tempDir, true)).trim();
  console.log('✅', `Package "${packageName}" was packed`);

  return {
    packageName,
    file: packFile,
  };
}
