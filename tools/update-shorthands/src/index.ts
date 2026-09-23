import fs from 'fs/promises';
import path from 'path';

import { fetchMdnData } from './fetchMdnData.ts';
import { fileTemplate } from './fileTemplate.ts';
import { assignShorthandPriority } from './assignShorthandPriority.ts';
import { filterShorthandsProperties } from './filterShorthandsProperties.ts';
import { prepareProperties } from './prepareProperties.ts';
import type { CSSShorthands } from './types.ts';

// The following are logical properties that MDN does NOT expose, so the generator can't derive them
// automatically. They are a MANUAL supplement — NOT the full logical set. Do not add properties here
// that already come from MDN shorthand data.

// Logical border shorthands (e.g. `borderBlockColor` sets both block edges), declared as
// property -> reset longhands; the logical shorthand tier (1) is applied at merge time.
const MANUAL_LOGICAL_SHORTHANDS: Record<string, string[]> = {
  borderBlockColor: ['borderBlockEndColor', 'borderBlockStartColor'],
  borderBlockStyle: ['borderBlockEndStyle', 'borderBlockStartStyle'],
  borderBlockWidth: ['borderBlockEndWidth', 'borderBlockStartWidth'],
  borderInlineColor: ['borderInlineEndColor', 'borderInlineStartColor'],
  borderInlineStyle: ['borderInlineEndStyle', 'borderInlineStartStyle'],
  borderInlineWidth: ['borderInlineEndWidth', 'borderInlineStartWidth'],
};

// Standalone logical longhands that overlap a physical longhand (e.g. `inlineSize` over `width`).
// Edge longhands reset by the shorthands above are derived so they can never drift out of sync.
const MANUAL_LOGICAL_LONGHANDS = [
  // Sizing
  'blockSize',
  'inlineSize',
  'maxBlockSize',
  'maxInlineSize',
  'minBlockSize',
  'minInlineSize',
  // Corner radii
  'borderEndEndRadius',
  'borderEndStartRadius',
  'borderStartEndRadius',
  'borderStartStartRadius',
  // Edge longhands of the logical border shorthands
  ...Object.values(MANUAL_LOGICAL_SHORTHANDS).flat(),
];

async function updateShorthands() {
  const data = await fetchMdnData();

  const filteredMdnData = filterShorthandsProperties(data);
  const mergedShorthandProperties = prepareProperties(filteredMdnData);
  const shorthands: CSSShorthands = {
    ...assignShorthandPriority(mergedShorthandProperties),
    ...Object.fromEntries(
      Object.entries(MANUAL_LOGICAL_SHORTHANDS).map(([property, longhands]): [string, [number, string[]]] => [
        property,
        [1, longhands],
      ]),
    ),
    ...Object.fromEntries(
      MANUAL_LOGICAL_LONGHANDS.map((property): [string, [number, string[]]] => [property, [2, []]]),
    ),
  };

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
