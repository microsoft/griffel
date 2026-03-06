/**
 * Copied from @linaria/shaker v3.0.0-beta.22
 * https://github.com/callstack/linaria/tree/%40linaria/shaker%403.0.0-beta.22/packages/shaker
 *
 * This is the evaluator entry point. It takes source code, transforms it with Babel
 * to produce CJS code, then parses it with oxc-parser, tree-shakes ("shakes") it
 * to remove dead code, and returns the shaken source code along with import metadata.
 */

import { transformSync } from '@babel/core';
import { parseSync } from 'oxc-parser';
import type { Program } from 'oxc-parser';

import { buildOptions, debug } from './utils.js';
import type { Evaluator, StrictOptions } from './utils.js';

import shake from './shaker.js';

export { default as buildDepsGraph } from './graphBuilder.js';

function prepareForShake(filename: string, options: StrictOptions, code: string): { program: Program; code: string } {
  const transformOptions = buildOptions(filename, options);

  transformOptions.presets!.unshift([
    require.resolve('@babel/preset-env'),
    {
      targets: 'ie 11',
    },
  ]);
  transformOptions.plugins!.unshift(require.resolve('babel-plugin-transform-react-remove-prop-types'));
  transformOptions.plugins!.unshift([require.resolve('@babel/plugin-transform-runtime'), { useESModules: false }]);

  debug(
    'evaluator:shaker:transform',
    `Transform ${filename} with options ${JSON.stringify(transformOptions, null, 2)}`,
  );
  const transformed = transformSync(code, transformOptions);

  if (transformed === null || !transformed.code) {
    throw new Error(`${filename} cannot be transformed`);
  }

  const cjsCode = transformed.code;
  const parsed = parseSync(filename, cjsCode);

  return { program: parsed.program, code: cjsCode };
}

const shaker: Evaluator = (filename, options, text, only = null) => {
  const { program, code: cjsCode } = prepareForShake(filename, options, text);
  const [shakenCode, imports] = shake(program, cjsCode, only);
  return [shakenCode, imports];
};

export default shaker;
