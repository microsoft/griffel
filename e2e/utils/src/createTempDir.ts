import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { logStep } from './step.ts';

export function createTempDir(prefix: string) {
  const startedAt = Date.now();
  // `mkdtempSync` appends 6 random characters to the provided prefix path
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `${prefix}-`));

  logStep(`Temporary directory created under ${tempDir}`, startedAt);

  return tempDir;
}

/**
 * Removes a directory created by `createTempDir()`, mimicking `tmp`'s `unsafeCleanup: true`
 * behavior i.e. removing it even if it still has files inside.
 *
 * Each temporary directory holds a full `node_modules` tree, so leaking them is expensive. Call
 * this from an `afterAll()` hook, which Vitest runs even when `beforeAll()` failed halfway through.
 */
export function removeTempDir(tempDir: string) {
  try {
    fs.rmSync(tempDir, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors, a leftover temporary directory must never fail a test.
  }
}
