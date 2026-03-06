import * as path from 'path';
import * as fs from 'fs';
import * as logSymbols from 'log-symbols';

import { sh } from './sh';

/**
 * Rewrites paths in package.json to be relative to the dist directory.
 * e.g. "./dist/index.esm.js" becomes "./index.esm.js"
 */
function rewritePackageJsonForDist(packageJsonContent: string): string {
  return packageJsonContent.replace(/"\.\/(dist)\//g, '"./');
}

export async function packLocalPackage(rootDir: string, tempDir: string, packageName: string) {
  const packagePath = path.resolve(rootDir, 'packages', packageName.split('/')[1]);
  const distPath = path.resolve(packagePath, 'dist');
  const distPathExists = !!(await fs.promises.stat(distPath).catch(() => false));

  if (!distPathExists) {
    throw new Error(`A directory with artifacts (${distPath}) does not exist`);
  }

  // Copy package.json into dist with paths rewritten to be relative to dist.
  // The old @nx/rollup:rollup executor did this automatically; with plain rollup we do it manually.
  const packageJsonContent = await fs.promises.readFile(path.resolve(packagePath, 'package.json'), 'utf-8');
  await fs.promises.writeFile(path.resolve(distPath, 'package.json'), rewritePackageJsonForDist(packageJsonContent));

  // Use `npm pack` because `yarn pack` incorrectly calculates the included files when the
  // files to include/exclude are specified by .npmignore rather than package.json `files`.
  // (--quiet outputs only the .tgz filename, not all the included files)
  const packFile = (await sh(`npm pack --quiet ${distPath}`, tempDir, true)).trim();
  console.log(logSymbols.success, `Package "${packageName}" was packed`);

  // Clean up the temporary package.json in dist
  await fs.promises.unlink(path.resolve(distPath, 'package.json'));

  return {
    packageName,
    file: packFile,
  };
}
