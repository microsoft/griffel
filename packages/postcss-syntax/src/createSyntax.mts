import type { ModuleConfig } from './transform-sync.mjs';
import type * as postcss from 'postcss';

import { parse } from './parse.mjs';
import { stringify } from './stringify.mjs';

/**
 * Creates a custom syntax with configured options
 * @param options - Options to configure the transform
 * @returns a postcss custom syntax
 */
export function createSyntax(options: { modules?: ModuleConfig[] }): postcss.Syntax {
  const extendedParse: postcss.Parser = (css, opts) => parse(css, { ...opts, ...options });

  return {
    stringify,
    parse: extendedParse,
  };
}
