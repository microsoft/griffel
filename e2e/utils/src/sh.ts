import childProcess from 'child_process';

/**
 * Spawns a command and resolves with its `stdout` once it exits successfully.
 *
 * Output is always captured so that a failure can carry the child's diagnostics in the rejected
 * error — a test runner can only report what it is given. When `pipeOutputToResult` is `false` the
 * captured output is additionally echoed to the parent's streams so long-running commands stay
 * observable while they run.
 */
export function sh(command: string, cwd?: string, pipeOutputToResult = false): Promise<string> {
  return new Promise((resolve, reject) => {
    const [cmd, ...args] = command.split(' ');
    const options: childProcess.SpawnOptions = {
      cwd: cwd || process.cwd(),
      env: process.env,
      stdio: ['inherit', 'pipe', 'pipe'],
      shell: true,
    };

    const child = childProcess.spawn(cmd, args, options);

    let stdoutData = '';
    let stderrData = '';

    child.stdout?.on('data', data => {
      stdoutData += data;

      if (!pipeOutputToResult) {
        process.stdout.write(data);
      }
    });

    child.stderr?.on('data', data => {
      stderrData += data;

      if (!pipeOutputToResult) {
        process.stderr.write(data);
      }
    });

    // Without this a failure to spawn (`ENOENT`, permissions, ...) never settles the promise.
    child.on('error', reject);

    child.on('close', code => {
      if (code === 0) {
        resolve(stdoutData);
        return;
      }

      reject(new Error([`child process exited with code ${code}`, stdoutData, stderrData].filter(Boolean).join('\n')));
    });
  });
}
