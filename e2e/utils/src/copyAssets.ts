import fs from 'fs';
import path from 'path';
import logSymbols from 'log-symbols';

export async function copyAssets(options: { assetsPath: string; tempDir: string; renames?: Record<string, string> }) {
  const { assetsPath, tempDir, renames } = options;

  await fs.promises.cp(assetsPath, tempDir, { recursive: true });

  if (renames) {
    await Promise.all(
      Object.entries(renames).map(([source, target]) =>
        fs.promises.rename(path.resolve(tempDir, source), path.resolve(tempDir, target)),
      ),
    );
  }

  console.log(logSymbols.success, 'Assets were copied');
}
