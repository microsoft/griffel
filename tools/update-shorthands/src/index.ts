import fs from 'fs/promises';
import path from 'path';

import { fetchMdnData } from './fetchMdnData.ts';
import { fileTemplate } from './fileTemplate.ts';
import { assignShorthandPriority } from './assignShorthandPriority.ts';
import { filterShorthandsProperties } from './filterShorthandsProperties.ts';
import { prepareProperties } from './prepareProperties.ts';

async function updateShorthands() {
  const data = await fetchMdnData();

  const filteredMdnData = filterShorthandsProperties(data);
  const mergedShorthandProperties = prepareProperties(filteredMdnData);
  const shorthands = assignShorthandPriority(mergedShorthandProperties);

  const outputPath = path.resolve(
    import.meta.dirname,
    '..',
    '..',
    '..',
    'packages',
    'core',
    'src',
    'runtime',
    'shorthands.ts',
  );

  await fs.writeFile(outputPath, await fileTemplate(shorthands), 'utf-8');
}

updateShorthands().then(() => {
  console.log('Shorthands in "./packages/core/src/runtime/shorthands.ts" were updated');
});
