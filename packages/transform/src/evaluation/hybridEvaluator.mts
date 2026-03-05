import { extname } from 'node:path';
import { parseSync, rawTransferSupported } from 'oxc-parser';

import type { Evaluator } from './types.mjs';

const CJS_EXTENSIONS = new Set(['.cjs', '.cts', '.json']);
const ESM_EXTENSIONS = new Set(['.mjs', '.mts']);

const useRawTransfer = rawTransferSupported();

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
    // experimentalLazy skips AST deserialization, we only need module metadata
    const parseResult = parseSync(filename, text, {
      sourceType: 'unambiguous',
      ...(useRawTransfer && { experimentalLazy: true }),
    } as Parameters<typeof parseSync>[2]);

    const isESM = parseResult.module.hasModuleSyntax;

    (parseResult as { dispose?: () => void }).dispose?.();

    if (!isESM) {
      return [text, null];
    }

    return shakerEvaluator(filename, options, text, only);
  };
}
