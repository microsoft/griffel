/**
 * Copies package.json, README.md, LICENSE.md into the package's dist/.
 *
 * Usage: node tools/copy-pkg-assets.mjs <package-dir>
 *
 * Reads <package-dir>/{package.json,README.md} and copies them along with
 * the workspace-root LICENSE.md into <package-dir>/dist/.
 */
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const [pkgDir] = process.argv.slice(2);
if (!pkgDir) {
  console.error('Usage: node tools/copy-pkg-assets.mjs <package-dir>');
  process.exit(1);
}

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const absPkg = resolve(repoRoot, pkgDir);
const distDir = join(absPkg, 'dist');

mkdirSync(distDir, { recursive: true });

const pkgJson = JSON.parse(readFileSync(join(absPkg, 'package.json'), 'utf8'));
delete pkgJson.scripts;
delete pkgJson.devDependencies;
writeFileSync(join(distDir, 'package.json'), JSON.stringify(pkgJson, null, 2) + '\n');

for (const f of ['README.md', 'LICENSE.md']) {
  const src = existsSync(join(absPkg, f)) ? join(absPkg, f) : join(repoRoot, f);
  if (existsSync(src)) copyFileSync(src, join(distDir, f));
}
