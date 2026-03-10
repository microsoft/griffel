import { extname } from 'node:path';
import { parseSync, rawTransferSupported } from 'oxc-parser';

import type { Evaluator, TransformPerfIssue } from './types.mjs';

const CJS_EXTENSIONS = new Set(['.cjs', '.cts', '.json']);
const ESM_EXTENSIONS = new Set(['.mjs', '.mts']);

const useRawTransfer = rawTransferSupported();

const NODE_MODULES_RE = /[/\\]node_modules[/\\]/;

const EXPORT_STAR_RE = /export\s+\*\s+from\s/;

export function createHybridEvaluator(shakerEvaluator: Evaluator, perfIssues?: TransformPerfIssue[]): Evaluator {
  return (filename, text, only) => {
    // Non-node_modules: always shake
    if (!NODE_MODULES_RE.test(filename)) {
      const result = shakerEvaluator(filename, text, only);

      if (perfIssues && EXPORT_STAR_RE.test(result.code)) {
        perfIssues.push({ type: 'barrel-export-star', dependencyFilename: filename });
      }

      return result;
    }

    // node_modules: detect CJS vs ESM
    const ext = extname(filename);

    // Fast path: extension tells us the answer
    if (CJS_EXTENSIONS.has(ext)) {
      perfIssues?.push({ type: 'cjs-module', dependencyFilename: filename });
      return { code: text, imports: null, moduleKind: 'cjs' };
    }
    if (ESM_EXTENSIONS.has(ext)) {
      const result = shakerEvaluator(filename, text, only);

      if (perfIssues && EXPORT_STAR_RE.test(result.code)) {
        perfIssues.push({ type: 'barrel-export-star', dependencyFilename: filename });
      }

      return result;
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
      perfIssues?.push({ type: 'cjs-module', dependencyFilename: filename });
      return { code: text, imports: null, moduleKind: 'cjs' };
    }

    const result = shakerEvaluator(filename, text, only);

    if (perfIssues && EXPORT_STAR_RE.test(result.code)) {
      perfIssues.push({ type: 'barrel-export-star', dependencyFilename: filename });
    }

    return result;
  };
}
