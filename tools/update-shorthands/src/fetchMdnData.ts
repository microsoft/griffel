import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import { type MdnData } from './types.ts';

// TODO: replace with `import cssTypePkg from 'csstype/package.json' with { type: 'json' }`
// once the workspace's prettier version parses the import-attributes syntax.
const require = createRequire(import.meta.url);
const GIT_URL_REGEX = /git\+https:\/\/github.com\/mdn\/data.git#(.+)/;
const SEMVER_REGEX = /^\d+\.\d+\.\d+$/;

export async function fetchMdnData(): Promise<MdnData> {
  const cssTypePkgPath = require.resolve('csstype/package.json');
  const cssTypePkg = JSON.parse(await fs.readFile(cssTypePkgPath, 'utf-8'));

  const mdnDataVersion: string = cssTypePkg.devDependencies['mdn-data'];
  let ref: string;

  if (GIT_URL_REGEX.test(mdnDataVersion)) {
    ref = mdnDataVersion.split('#')[1];
  } else if (SEMVER_REGEX.test(mdnDataVersion)) {
    ref = `v${mdnDataVersion}`;
  } else {
    throw new Error(`"mdn-data" version is not in the correct format: ${mdnDataVersion}`);
  }

  const url = `https://raw.githubusercontent.com/mdn/data/${ref}/css/properties.json`;
  const response = await fetch(url);

  return await response.json();
}
