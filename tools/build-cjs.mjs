/**
 * Converts ESM .js files to CJS .js files using SWC.
 *
 * Usage: node tools/build-cjs.mjs <esm-dir> <cjs-dir>
 */
import { transformFileSync } from '@swc/core';
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve, relative } from 'node:path';

const [esmDir, cjsDir] = process.argv.slice(2);

if (!esmDir || !cjsDir) {
  console.error('Usage: node tools/build-cjs.mjs <esm-dir> <cjs-dir>');
  process.exit(1);
}

const absEsmDir = resolve(esmDir);
const absCjsDir = resolve(cjsDir);

function collectJsFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectJsFiles(fullPath));
    } else if (entry.name.endsWith('.js')) {
      results.push(fullPath);
    }
  }
  return results;
}

const jsFiles = collectJsFiles(absEsmDir);

for (const absInput of jsFiles) {
  const rel = relative(absEsmDir, absInput);
  const absOutput = join(absCjsDir, rel);

  const result = transformFileSync(absInput, {
    module: { type: 'commonjs' },
    jsc: {
      parser: { syntax: 'ecmascript' },
      target: 'es2022',
    },
    sourceMaps: false,
  });

  mkdirSync(dirname(absOutput), { recursive: true });
  writeFileSync(absOutput, result.code);
}

console.log(`Converted ${jsFiles.length} ESM → CJS files into ${cjsDir}`);
