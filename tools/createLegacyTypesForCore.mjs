import fs from 'fs-extra';
import glob from 'glob';
import logSymbols from 'log-symbols';
import path from 'path';

const dirname = path.dirname(new URL(import.meta.url).pathname);

(async () => {
  const distDir = path.resolve(dirname, '..', 'dist', 'packages', 'core');
  const distDirExists = !!(await fs.promises.stat(distDir).catch(() => false));

  if (!distDirExists) {
    throw new Error(`A directory with artifacts (${distDir}) does not exist`);
  }

  const files = glob.sync('**/*.d.ts', { cwd: distDir });
  const legacyTypesDir = path.resolve(distDir, 'types-legacy');

  await fs.mkdir(legacyTypesDir);
  await Promise.all(
    files.map(filename => fs.copy(path.resolve(distDir, filename), path.resolve(legacyTypesDir, filename))),
  );

  console.log(logSymbols.success, `Copied typings files to "${legacyTypesDir}"`);

  await fs.writeFile(
    path.resolve(legacyTypesDir, 'types', 'index.d.ts'),
    (
      await fs.readFile(path.resolve(legacyTypesDir, 'types', 'index.d.ts'), {
        encoding: 'utf-8',
      })
    ).replace('./types-modern', './types-legacy'),
  );
  await fs.unlink(path.resolve(legacyTypesDir, 'types', 'types-modern.d.ts'));

  console.log(logSymbols.success, `Modified imports & removed "types-modern.d.ts"`);
})();
