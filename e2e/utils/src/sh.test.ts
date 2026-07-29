import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { sh } from './sh.ts';

// `sh()` splits a command on spaces and runs the result through a shell, so probes live in a script
// file rather than inlined — quoting anything beyond a flag is not something it supports.
let scriptDir: string;
let longRunningScript: string;

beforeAll(() => {
  scriptDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sh-test-'));
  longRunningScript = path.join(scriptDir, 'long-running.cjs');

  // Records its own PID so a test can assert on the process itself, then stays alive long enough
  // that only a timeout can end it.
  fs.writeFileSync(
    longRunningScript,
    [
      'const [, , pidFile] = process.argv;',
      'require("fs").writeFileSync(pidFile, String(process.pid));',
      'setTimeout(() => {}, 120000);',
    ].join('\n'),
  );
});

afterAll(() => fs.rmSync(scriptDir, { recursive: true, force: true }));

/**
 * Resolves once the process is gone, rejects if it is still alive after `timeout`.
 *
 * `process.kill(pid, 0)` runs the existence check without sending a signal, which is the only way
 * to observe a process this test deliberately does not own.
 */
async function waitForExit(pid: number, timeout = 10_000): Promise<void> {
  const deadline = Date.now() + timeout;

  while (Date.now() < deadline) {
    try {
      process.kill(pid, 0);
    } catch {
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 50));
  }

  throw new Error(`Process ${pid} was still running ${timeout}ms after its command timed out`);
}

describe('sh', () => {
  it('resolves with stdout when a command succeeds', async () => {
    await expect(sh('echo hello', undefined, { pipeOutputToResult: true })).resolves.toContain('hello');
  });

  it('rejects with the captured output when a command fails', async () => {
    const error: Error = await sh('node --eval-oops', undefined, { pipeOutputToResult: true }).catch(e => e);

    expect(error.message).toContain('child process exited with code');
    // stderr has to survive into the message — it is the only diagnostic a failing command leaves.
    expect(error.message).toContain('eval-oops');
  });

  it('rejects when a command cannot be spawned', async () => {
    await expect(sh('echo nope', path.join(scriptDir, 'does-not-exist'))).rejects.toThrow();
  });

  it('names the command and the limit it exceeded when a timeout is reached', async () => {
    const pidFile = path.join(scriptDir, 'named.pid');
    const error: Error = await sh(`node ${longRunningScript} ${pidFile}`, undefined, {
      pipeOutputToResult: true,
      timeout: 1_000,
    }).catch(e => e);

    expect(error.message).toContain('timed out');
    expect(error.message).toContain('limit: 1000ms');
    expect(error.message).toContain(longRunningScript);
  });

  it('kills the process behind a timed out command, not just the shell it spawned', async () => {
    // Vitest's `hookTimeout` abandons the promise while leaving the process running, which is what
    // let an overrunning `yarn install` keep competing with the scenarios that followed it. And as
    // `shell: true` makes the direct child a shell, signalling that child alone would leave the
    // command doing the actual work behind.
    const pidFile = path.join(scriptDir, 'killed.pid');

    await expect(
      sh(`node ${longRunningScript} ${pidFile}`, undefined, { pipeOutputToResult: true, timeout: 2_000 }),
    ).rejects.toThrow('timed out');

    const commandPid = Number(fs.readFileSync(pidFile, 'utf8'));

    expect(Number.isInteger(commandPid)).toBe(true);
    expect(commandPid).not.toBe(process.pid);

    await expect(waitForExit(commandPid)).resolves.toBeUndefined();
  });

  it('does not leave a pending timer behind when a command finishes early', async () => {
    // A leaked `setTimeout` would hold the worker's event loop open for the whole budget.
    const timers = () => process.getActiveResourcesInfo().filter(resource => resource === 'Timeout').length;
    const before = timers();

    await sh('echo done', undefined, { pipeOutputToResult: true, timeout: 300_000 });

    expect(timers()).toBe(before);
  });
});
