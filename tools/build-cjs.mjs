/**
 * Converts ESM .js files to CJS .cjs files using SWC.
 * Also copies .d.ts files alongside as .d.cts so consumers using the
 * `require` exports condition under moduleResolution: node16/nodenext
 * see CJS-context type declarations.
 *
 * Usage: node tools/build-cjs.mjs <esm-dir> <cjs-dir>
 */
import { transformFileSync } from '@swc/core';
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve, relative } from 'node:path';

const [esmDir, cjsDir] = process.argv.slice(2);

if (!esmDir || !cjsDir) {
  console.error('Usage: node tools/build-cjs.mjs <esm-dir> <cjs-dir>');
  process.exit(1);
}

const absEsmDir = resolve(esmDir);
const absCjsDir = resolve(cjsDir);

function collectFiles(dir, predicate) {
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'cjs') continue; // skip output sub-directory
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFiles(fullPath, predicate));
    } else if (predicate(entry.name)) {
      results.push(fullPath);
    }
  }
  return results;
}

const jsFiles = collectFiles(absEsmDir, name => name.endsWith('.js'));

for (const absInput of jsFiles) {
  const rel = relative(absEsmDir, absInput);
  const absOutput = join(absCjsDir, rel.replace(/\.js$/, '.cjs'));

  const result = transformFileSync(absInput, {
    module: { type: 'commonjs' },
    jsc: {
      parser: { syntax: 'ecmascript' },
      target: 'es2022',
    },
    sourceMaps: false,
  });

  // Rewrite .js requires to .cjs
  const cjsCode = result.code.replace(/(require\(["']\.\.?\/[^"']+)\.js(["']\))/g, '$1.cjs$2');

  mkdirSync(dirname(absOutput), { recursive: true });
  writeFileSync(absOutput, cjsCode);
}

const dtsFiles = collectFiles(absEsmDir, name => name.endsWith('.d.ts') && !name.endsWith('.d.cts'));

for (const absInput of dtsFiles) {
  const rel = relative(absEsmDir, absInput);
  const absOutput = join(absCjsDir, rel.replace(/\.d\.ts$/, '.d.cts'));
  // Rewrite relative .js extensions in import/export specifiers to .cjs
  const dtsCode = readFileSync(absInput, 'utf8').replace(
    /(from\s+["']\.\.?\/[^"']+)\.js(["'])/g,
    '$1.cjs$2',
  );
  mkdirSync(dirname(absOutput), { recursive: true });
  writeFileSync(absOutput, dtsCode);
}

console.log(`Converted ${jsFiles.length} ESM → CJS files and ${dtsFiles.length} .d.ts → .d.cts into ${cjsDir}`);
