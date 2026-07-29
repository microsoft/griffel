import childProcess from 'child_process';

/**
 * Upper bound for a single command.
 *
 * Everything these suites run is a package manager, bundler or linter invocation that finishes in
 * seconds locally, so anything still going after two minutes is stuck rather than slow. Commands
 * that are legitimately slower pass a larger budget explicitly.
 */
export const DEFAULT_COMMAND_TIMEOUT = 120_000;

/** Grace period between asking a timed out command to stop and killing it outright. */
const SIGKILL_GRACE_PERIOD = 5_000;

export type ShOptions = {
  /**
   * Output is always captured and returned. By default it is *also* echoed to the parent's streams
   * so long-running commands stay observable; set this to keep it out of them.
   */
  pipeOutputToResult?: boolean;
  /** Milliseconds to wait before terminating the command and rejecting. */
  timeout?: number;
};

/**
 * `shell: true` spawns a shell that in turn spawns the real command, so signalling the child alone
 * would leave the actual work running. `detached: true` puts that shell in its own process group,
 * which a negative PID then signals as a whole.
 */
function killProcessTree(child: childProcess.ChildProcess, signal: NodeJS.Signals): void {
  if (typeof child.pid !== 'number') {
    return;
  }

  try {
    if (process.platform === 'win32') {
      childProcess.execSync(`taskkill /pid ${child.pid} /T /F`, { stdio: 'ignore' });
    } else {
      process.kill(-child.pid, signal);
    }
  } catch {
    // The process group exited between the timeout firing and the signal being delivered.
  }
}

/**
 * Spawns a command and resolves with its `stdout` once it exits successfully.
 *
 * Output is always captured so that a failure can carry the child's diagnostics in the rejected
 * error — a test runner can only report what it is given. When `pipeOutputToResult` is `false` the
 * captured output is additionally echoed to the parent's streams so long-running commands stay
 * observable while they run.
 *
 * Every command is bounded by its own timeout. Vitest's `testTimeout`/`hookTimeout` cannot serve
 * that purpose: they abandon the *promise* without touching the process behind it, so a slow
 * install keeps downloading and competing for the runner's CPU, network and Yarn cache with the
 * scenarios that follow — while `afterAll` deletes the directory it is still writing into. Timing
 * out here kills the process group instead, and names the command that hung, which a bare
 * "Hook timed out in 120000ms" never does.
 */
export function sh(command: string, cwd?: string, options: ShOptions = {}): Promise<string> {
  const { pipeOutputToResult = false, timeout = DEFAULT_COMMAND_TIMEOUT } = options;

  return new Promise((resolve, reject) => {
    const [cmd, ...args] = command.split(' ');
    const spawnOptions: childProcess.SpawnOptions = {
      cwd: cwd || process.cwd(),
      env: process.env,
      stdio: ['inherit', 'pipe', 'pipe'],
      shell: true,
      detached: process.platform !== 'win32',
    };

    const child = childProcess.spawn(cmd, args, spawnOptions);
    const startedAt = Date.now();

    let stdoutData = '';
    let stderrData = '';
    let timedOut = false;
    let sigkillTimer: NodeJS.Timeout | undefined;

    const timeoutTimer = setTimeout(() => {
      timedOut = true;

      // `SIGTERM` first so a package manager can unwind — a half-written cache entry would poison
      // every later run — then `SIGKILL`, which cannot be ignored, so `close` always fires.
      killProcessTree(child, 'SIGTERM');
      sigkillTimer = setTimeout(() => killProcessTree(child, 'SIGKILL'), SIGKILL_GRACE_PERIOD);
    }, timeout);

    function clearTimers() {
      clearTimeout(timeoutTimer);
      clearTimeout(sigkillTimer);
    }

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
    child.on('error', error => {
      clearTimers();
      reject(error);
    });

    child.on('close', code => {
      clearTimers();

      if (timedOut) {
        reject(
          new Error(
            [
              `child process timed out after ${Date.now() - startedAt}ms (limit: ${timeout}ms): ${command}`,
              `  in "${spawnOptions.cwd}"`,
              stdoutData,
              stderrData,
            ]
              .filter(Boolean)
              .join('\n'),
          ),
        );
        return;
      }

      if (code === 0) {
        resolve(stdoutData);
        return;
      }

      reject(new Error([`child process exited with code ${code}`, stdoutData, stderrData].filter(Boolean).join('\n')));
    });
  });
}
