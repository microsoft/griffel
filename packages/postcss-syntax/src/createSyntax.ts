import type { ParserOptions } from './parse.js';
import type * as postcss from 'postcss';

import { parse } from './parse.js';
import { stringify } from './stringify.js';

/**
 * Creates a custom syntax with configured options
 * @param options - Options to configure the transform
 * @returns a postcss custom syntax
 */
export function createSyntax(
  options: Pick<ParserOptions, 'importsToTransform' | 'functionsToTransform'>,
): postcss.Syntax {
  const extendedParse: postcss.Parser = (css, opts) => parse(css, { ...opts, ...options });

  return {
    stringify,
    parse: extendedParse,
  };
}
