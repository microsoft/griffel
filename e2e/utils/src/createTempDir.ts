import * as tmp from 'tmp';
import * as logSymbols from 'log-symbols';

export function createTempDir(prefix: string) {
  // "Unsafe" means delete even if it still has files inside (our desired behavior)
  const tempDir = tmp.dirSync({ prefix, unsafeCleanup: true }).name;
  console.log(logSymbols.success, `Temporary directory created under ${tempDir}`);

  return tempDir;
}
