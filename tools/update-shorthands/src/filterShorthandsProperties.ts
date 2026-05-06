// TODO: prefer `import { UNSUPPORTED_CSS_PROPERTIES } from '@griffel/core'`. Today the
// workspace symlink resolves to packages/core which only ships .ts sources, and Node
// can't resolve the package.json `import` field (./src/index.js). Options to revisit:
//   1. A custom Node loader hook that rewrites @griffel/core to the dist path.
//   2. Repoint the node_modules/@griffel/core symlink at dist/packages/core post-build.
//   3. Add a "source" export condition to packages/core/package.json and run with
//      `node --conditions=source`.
//   4. Inline the constant or read it from the source TS file directly.
import { UNSUPPORTED_CSS_PROPERTIES } from '../../../dist/packages/core/src/index.js';

import type { MdnData, MdnShorthandProperty } from './types.ts';
import { isShorthandProperty, isVendorProperty, toCamelCase } from './utils.ts';

function isSupportedShorthand(property: string): boolean {
  return !Object.prototype.hasOwnProperty.call(UNSUPPORTED_CSS_PROPERTIES, toCamelCase(property));
}

export function filterShorthandsProperties(data: MdnData) {
  const filteredData: Record<string, MdnShorthandProperty> = {};

  for (const [property, value] of Object.entries(data)) {
    if (value.status === 'obsolete' || isVendorProperty(property) || !isShorthandProperty(value)) {
      continue;
    }

    if (isSupportedShorthand(property)) {
      filteredData[property] = {
        computed: value.computed.filter(isSupportedShorthand),
        status: value.status,
      };
    }
  }

  return filteredData;
}
