// @ts-check

const childProcess = require('child_process');

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

let completedPrepublish = false;

/**
 * @type {import('beachball').BeachballConfig['hooks']}
 */
module.exports = {
  // Executed after all package versions were bumped -> run build
  // If we run build before `beachball publish`, artifacts would have
  // old (without bump) versions.
  async prepublish() {
    // `beachball` runs this hook for every package, we want to run it only once.
    if (!completedPrepublish) {
      await sh('yarn nx run-many --target=build --all --parallel --max-parallel=3');
      completedPrepublish = true;
    }
  },
};
