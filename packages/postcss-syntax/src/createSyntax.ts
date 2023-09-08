import * as postcss from 'postcss';
import { parse } from './parse';
import { stringify } from './stringify';
import { BabelPluginOptions } from '@griffel/babel-preset';

/**
 * Creates a custom syntax with configured options for @griffel/babel-preset
 * @param options - Options to configure @griffel/babel-preset
 * @returns a postcss custom syntax
 */
export function createSyntax(options: BabelPluginOptions): postcss.Syntax {
  const extendedParse: postcss.Parser = (css, opts) => parse(css, { ...opts, griffelPreset: { ...options } });

  return {
    stringify,
    parse: extendedParse,
  };
}
