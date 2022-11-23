import * as fs from 'fs';
import * as path from 'path';
import * as logSymbols from 'log-symbols';

import { sh } from './sh';

export async function configureYarn(options: { tempDir: string; rootDir: string }) {
  const { tempDir, rootDir } = options;
  const yarnPath = await sh('yarn config get yarnPath', rootDir, true);

  await fs.promises.writeFile(
    path.resolve(tempDir, '.yarnrc.yml'),
    ['enableImmutableInstalls: false', 'nodeLinker: node-modules', `yarnPath: ${yarnPath}`].join('\n'),
  );
  await sh('yarn init -p', tempDir, true);

  console.log(logSymbols.success, 'A config for Yarn was created');
  console.log(logSymbols.info, 'Using Yarn', (await sh('yarn --version', tempDir, true)).trim());
}
