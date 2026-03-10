/**
 * Copied from @linaria/shaker v3.0.0-beta.22
 * https://github.com/callstack/linaria/tree/%40linaria/shaker%403.0.0-beta.22/packages/shaker
 *
 * This is the evaluator entry point. It takes source code, parses it with oxc-parser,
 * tree-shakes ("shakes") it to remove dead code, and returns the shaken source code
 * along with import metadata.
 */

import path from 'node:path';
import { parseSync } from 'oxc-parser';
import type { Program } from 'oxc-parser';
import { transformSync } from 'oxc-transform';

import { debug } from './utils.js';
import type { Evaluator } from './utils.js';

import shake from './shaker.js';

export { default as buildDepsGraph } from './graphBuilder.js';

const needsTransformExtensions = new Set(['ts', 'tsx', 'jsx', 'mts', 'cts']);

function prepareForShake(filename: string, code: string): { program: Program; code: string } {
  const ext = path.extname(filename).slice(1).toLowerCase();
  let sourceCode = code;

  // Strip TypeScript/JSX syntax if needed
  if (needsTransformExtensions.has(ext)) {
    const result = transformSync(filename, code, {});
    sourceCode = result.code;
  }

  debug('evaluator:shaker:transform', `Parsed ${filename}`);
  const parsed = parseSync(filename, sourceCode);

  return { program: parsed.program, code: sourceCode };
}

const shaker: Evaluator = (filename, text, only = null) => {
  const { program, code } = prepareForShake(filename, text);
  const [shakenCode, imports] = shake(program, code, only);
  return { code: shakenCode, imports, moduleKind: 'esm' };
};

export default shaker;
