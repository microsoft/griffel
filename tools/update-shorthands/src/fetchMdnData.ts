import * as fs from 'node:fs/promises';
import { type MdnData } from './types';

const VERSION_REGEX = /git\+https:\/\/github.com\/mdn\/data.git#(.+)/;

export async function fetchMdnData(): Promise<MdnData> {
  const cssTypePkgPath = require.resolve('csstype/package.json');
  const cssTypePkg = JSON.parse(await fs.readFile(cssTypePkgPath, 'utf-8'));

  const mdnDataVersion = cssTypePkg.devDependencies['mdn-data'];

  if (!VERSION_REGEX.test(mdnDataVersion)) {
    throw new Error('"mdn-data" version is not in the correct format');
  }

  const [, currentMdnDataCommit] = mdnDataVersion.split('#');
  const url = `https://raw.githubusercontent.com/mdn/data/${currentMdnDataCommit}/css/properties.json`;
  const response = await fetch(url);

  return await response.json();
}
