import * as fs from 'fs/promises';
import * as path from 'path';

import { fetchMdnData } from './fetchMdnData';
import { fileTemplate } from './fileTemplate';
import { assignShorthandPriority } from './assignShorthandPriority';
import { filterShorthandsProperties } from './filterShorthandsProperties';
import { mergeShorthandProperties } from './mergeShorthandProperties';

async function updateShorthands() {
  const data = await fetchMdnData();

  const shorthandProperties = filterShorthandsProperties(data);
  const mergedShorthandProperties = mergeShorthandProperties(shorthandProperties);
  const shorthands = assignShorthandPriority(mergedShorthandProperties);

  const outputPath = path.resolve(__dirname, '..', '..', '..', 'packages', 'core', 'src', 'runtime', 'shorthands.ts');

  await fs.writeFile(outputPath, await fileTemplate(shorthands), 'utf-8');
}

updateShorthands().then(() => {
  console.log('Shorthands in "./packages/core/src/runtime/shorthands.ts" were updated');
});
