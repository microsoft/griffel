import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as prettier from 'prettier';
import type { CSSShorthands } from './types';

export async function fileTemplate(shorthandProperties: CSSShorthands) {
  const prettierConfig = JSON.parse(
    await fs.readFile(path.resolve(__dirname, '../../../.prettierrc'), { encoding: 'utf-8' }),
  );
  const stringifiedOutput = JSON.stringify(shorthandProperties, null, 2);

  return prettier.format(
    `
//
// DO NOT MODIFY THIS FILE DIRECTLY, IT IS AUTO-GENERATED
// SEE tools/update-shorthands/src/index.ts
//
import type * as CSS from 'csstype';
import type { GriffelStylesUnsupportedCSSProperties } from '@griffel/style-types';

type AllowedShorthandProperties = keyof Omit<CSS.Properties, keyof GriffelStylesUnsupportedCSSProperties>;

export const shorthands: Partial<Record<AllowedShorthandProperties, [number, (keyof CSS.Properties)[]]>> = ${stringifiedOutput};`,
    { ...prettierConfig, parser: 'typescript' },
  );
}
