import * as childProcess from 'child_process';
import fs from 'fs';
import logSymbols from 'log-symbols';
import path from 'path';
import tmp from 'tmp';

/**
 * @param {String} command
 * @param {String?} cwd
 * @param {Boolean?} pipeOutputToResult
 *
 * @returns {Promise<string>}
 */
function sh(command, cwd, pipeOutputToResult = false) {
  return new Promise((resolve, reject) => {
    const [cmd, ...args] = command.split(' ');

    /** @type {import('child_process').SpawnOptions} */
    const options = {
      cwd: cwd || process.cwd(),
      env: process.env,
      stdio: pipeOutputToResult ? 'pipe' : 'inherit',
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

      reject(new Error(`child process exited with code ${code}`));
    });
  });
}

/**
 * @param {String} tsVersion
 */
async function performTest(tsVersion) {
  /** @type {String} */
  let tempDir;
  /** @type {String} */
  let tscBin;

  try {
    const dirname = path.dirname(new URL(import.meta.url).pathname);
    const rootDir = path.resolve(dirname, '..', '..', '..');

    const assetsPath = path.resolve(dirname, 'assets');

    // "Unsafe" means delete even if it still has files inside (our desired behavior)
    tempDir = tmp.dirSync({ prefix: 'typescript', unsafeCleanup: true }).name;

    console.log(logSymbols.success, `Temporary directory created under ${tempDir}`);

    const packagePath = path.resolve(rootDir, 'dist', 'packages', 'core');
    const packagePathExists = !!(await fs.promises.stat(packagePath).catch(() => false));

    if (!packagePathExists) {
      throw new Error(`A directory with artifacts (${packagePath}) does not exist`);
    }

    // Use `npm pack` because `yarn pack` incorrectly calculates the included files when the
    // files to include/exclude are specified by .npmignore rather than package.json `files`.
    // (--quiet outputs only the .tgz filename, not all the included files)
    const packFile = (await sh(`npm pack --quiet ${packagePath}`, tempDir, true)).trim();
    console.log(logSymbols.success, 'Package files were packed');

    await fs.promises.copyFile(path.resolve(assetsPath, 'fixture.ts'), path.join(tempDir, 'fixture.ts'));
    await fs.promises.copyFile(path.resolve(assetsPath, 'tsconfig.fixture.json'), path.join(tempDir, 'tsconfig.json'));

    await fs.promises.writeFile(
      path.resolve(tempDir, '.yarnrc'),
      `cache-folder "${path.resolve(tempDir, '.yarn-cache')}"`,
    );
    console.log(logSymbols.success, 'A fixture and configs were copied');

    console.log(logSymbols.info, 'Using Yarn', (await sh('yarn --version', tempDir, true)).trim());
    await sh(`yarn add --silent ./${packFile} typescript@${tsVersion}`, tempDir);
    console.log(logSymbols.success, 'Packages were installed');

    tscBin = path.resolve(tempDir, 'node_modules', 'typescript', 'bin', 'tsc');
    console.log(
      logSymbols.info,
      'Using TypeScript',
      (await sh(`${tscBin} --version`, tempDir, true)).replace('Version', '').trim(),
    );
  } catch (e) {
    console.error(logSymbols.error, 'Something went wrong setting up the test:');
    console.error(/** @type {Error} */ e?.stack || e);
    process.exit(1);
  }

  try {
    await sh(`${tscBin} --noEmit`, tempDir);

    console.log(logSymbols.success, `Example project was successfully built with typescript@${tsVersion}`);
    console.log('');
    console.log('');
  } catch (e) {
    console.error(e);

    console.log('');
    console.error(
      logSymbols.error,
      `Building a test project referencing @griffel/core using typescript@${tsVersion} failed.`,
    );
    console.error(
      `This is most likely because you added an API in @griffel/core or a dependency which uses ` +
        `typescript features introduced in a version newer than ${tsVersion} (see logs above for the exact error).`,
    );
    process.exit(1);
  }
}

(async () => {
  await performTest('3.9');
  await performTest('4.1');
  await performTest('4.4');
})();
