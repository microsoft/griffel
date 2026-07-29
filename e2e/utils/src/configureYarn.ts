import fs from 'fs';
import path from 'path';

import { sh } from './sh.ts';
import { step } from './step.ts';

/**
 * Reading a config value and scaffolding an empty project are local, offline operations — measured
 * well under a second, as `yarn init -p` has nothing to resolve, fetch or link.
 */
const YARN_CONFIG_TIMEOUT = 30_000;

export async function configureYarn(options: { tempDir: string; rootDir: string }) {
  const { tempDir, rootDir } = options;
  // `yarn config get` resolves `yarnPath` to an absolute path, which is what makes the release
  // usable from a temporary directory outside the repository. It is still `stdout`, so it arrives
  // with a trailing line break.
  const yarnPath = (
    await sh('yarn config get yarnPath', rootDir, { pipeOutputToResult: true, timeout: YARN_CONFIG_TIMEOUT })
  ).trim();

  await step('A config for Yarn was created', async () => {
    await fs.promises.writeFile(
      path.resolve(tempDir, '.yarnrc.yml'),
      ['enableImmutableInstalls: false', 'nodeLinker: node-modules', `yarnPath: ${yarnPath}`].join('\n'),
    );
    await sh('yarn init -p', tempDir, { pipeOutputToResult: true, timeout: YARN_CONFIG_TIMEOUT });
  });
  console.log(
    'ℹ️',
    'Using Yarn',
    (await sh('yarn --version', tempDir, { pipeOutputToResult: true, timeout: YARN_CONFIG_TIMEOUT })).trim(),
  );
}
