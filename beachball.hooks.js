// @ts-check

const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * @param {String} command
 *
 * @returns {Promise<string>}
 */
function sh(command) {
  return new Promise((resolve, reject) => {
    const [cmd, ...args] = command.split(' ');

    /** @type {import('child_process').SpawnOptions} */
    const options = {
      cwd: process.cwd(),
      env: process.env,
      stdio: 'inherit',
      shell: true,
    };
    const child = childProcess.spawn(cmd, args, options);

    let stdoutData = '';

    if (child.stdout) {
      child.stdout.on('data', data => {
        stdoutData += data;
      });
    }

    child.on('close', code => {
      if (code === 0) {
        resolve(stdoutData);
      }

      reject(new Error([`child process exited with code ${code}`, stdoutData].join('\n')));
    });
  });
}

const REPO_ROOT = __dirname;

/**
 * Make sure a workspace-rooted asset is present at the package root so `npm pack`
 * picks it up via the `files` field. Falls back to copying the workspace-root copy
 * when the package itself doesn't ship one (the LICENSE.md is shared across the
 * monorepo; some packages also rely on the root README).
 *
 * @param {string} packagePath
 * @param {string} asset
 */
function ensurePackageAsset(packagePath, asset) {
  const target = path.join(packagePath, asset);
  if (fs.existsSync(target)) return;
  const source = path.join(REPO_ROOT, asset);
  if (!fs.existsSync(source)) return;
  fs.copyFileSync(source, target);
}

/**
 * @type {import('beachball').BeachballConfig['hooks']}
 */
module.exports = {
  // Per-package: stage the workspace-root LICENSE/README into the package root so
  // `npm pack` (which beachball runs from the package root) finds them via `files`.
  async prepublish(packagePath) {
    ensurePackageAsset(packagePath, 'LICENSE.md');
    ensurePackageAsset(packagePath, 'README.md');
  },
  // Runs once after all bumps, before committing — update lockfile so it stays in sync
  async precommit() {
    // --no-immutable: Yarn 4 auto-enables immutable installs in CI, but we need to update the lockfile after version bumps
    await sh('yarn install --no-immutable');
  },
};
