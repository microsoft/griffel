import { extname } from 'node:path';
import { parseSync } from 'oxc-parser';

import type { Evaluator } from './types.mjs';

const CJS_EXTENSIONS = new Set(['.cjs', '.cts', '.json']);
const ESM_EXTENSIONS = new Set(['.mjs', '.mts']);

export function createHybridEvaluator(shakerEvaluator: Evaluator): Evaluator {
  return (filename, options, text, only) => {
    const ext = extname(filename);

    // Fast path: extension tells us the answer
    if (CJS_EXTENSIONS.has(ext)) {
      return [text, null];
    }
    if (ESM_EXTENSIONS.has(ext)) {
      return shakerEvaluator(filename, options, text, only);
    }

    // .js/.jsx/.ts/.tsx — detect via oxc-parser
    const parseResult = parseSync(filename, text);

    if (!parseResult.module.hasModuleSyntax) {
      return [text, null];
    }

    return shakerEvaluator(filename, options, text, only);
  };
}
