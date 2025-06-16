import { fileTemplate } from './fileTemplate';
import { type CSSShorthands } from './types';

describe('fileTemplate', () => {
  it('should return a formatted string', async () => {
    const shorthandProperties: CSSShorthands = {
      margin: [-1, ['marginTop']],
      padding: [-1, ['paddingTop']],
    };

    expect(await fileTemplate(shorthandProperties)).toMatchInlineSnapshot(`
      "//
      // DO NOT MODIFY THIS FILE DIRECTLY, IT IS AUTO-GENERATED
      // SEE tools/update-shorthands/src/index.ts
      //
      import type * as CSS from 'csstype';
      import type { GriffelStylesUnsupportedCSSProperties } from '@griffel/style-types';

      type AllowedShorthandProperties = keyof Omit<CSS.Properties, keyof GriffelStylesUnsupportedCSSProperties>;

      export const shorthands: Partial<Record<AllowedShorthandProperties, [number, (keyof CSS.Properties)[]]>> = {
        margin: [-1, ['marginTop']],
        padding: [-1, ['paddingTop']],
      };
      "
    `);
  });
});
