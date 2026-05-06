import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

export function createTempDir(prefix: string) {
  // `mkdtempSync` appends 6 random characters to the provided prefix path
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `${prefix}-`));

  // Mimic `tmp`'s `unsafeCleanup: true` behavior: remove the directory (even if it
  // still has files inside) when the process exits.
  process.once('exit', () => {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors during process exit.
    }
  });

  console.log('✅', `Temporary directory created under ${tempDir}`);

  return tempDir;
}
