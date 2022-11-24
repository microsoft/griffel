import * as fs from 'fs';
import * as fsExtra from 'fs-extra';
import * as path from 'path';
import * as logSymbols from 'log-symbols';

export async function copyAssets(options: { assetsPath: string; tempDir: string; renames?: Record<string, string> }) {
  const { assetsPath, tempDir, renames } = options;

  await fsExtra.copy(assetsPath, tempDir);

  if (renames) {
    await Promise.all(
      Object.entries(renames).map(([source, target]) =>
        fs.promises.rename(path.resolve(tempDir, source), path.resolve(tempDir, target)),
      ),
    );
  }

  console.log(logSymbols.success, 'Assets were copied');
}
