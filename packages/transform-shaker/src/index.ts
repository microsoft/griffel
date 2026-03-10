/**
 * Copied from @linaria/shaker v3.0.0-beta.22
 * https://github.com/callstack/linaria/tree/%40linaria/shaker%403.0.0-beta.22/packages/shaker
 *
 * This is the evaluator entry point. It takes source code, transforms it with Babel
 * to produce a CJS AST, then tree-shakes ("shakes") it to remove dead code, and returns
 * the shaken source code along with import metadata.
 */

import { transformSync } from '@babel/core';
import type { Node, Program } from '@babel/types';
import type { GeneratorResult } from '@babel/generator';

// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
const generator: (ast: Node) => GeneratorResult = require('@babel/generator').default;

import { buildOptions, debug } from './utils.js';
import type { Evaluator, StrictOptions } from './utils.js';

import shake from './shaker.js';

export { default as buildDepsGraph } from './graphBuilder.js';

function prepareForShake(filename: string, options: StrictOptions, code: string): Program {
  const transformOptions = buildOptions(filename, options);

  transformOptions.ast = true;
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

  if (transformed === null || !transformed.ast) {
    throw new Error(`${filename} cannot be transformed`);
  }

  return transformed.ast.program;
}

const shaker: Evaluator = (filename, options, text, only = null) => {
  const [shaken, imports] = shake(prepareForShake(filename, options, text), only);

  debug('evaluator:shaker:generate', `Generate shaken source code ${filename}`);
  const { code: shakenCode } = generator(shaken!);
  return [shakenCode, imports];
};

export default shaker;
