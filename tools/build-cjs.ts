/**
 * Converts a package's ESM build into a sibling CJS build:
 *  - <esmDir>/foo/bar.js     → <cjsDir>/foo/bar.cjs   (transpiled by SWC)
 *  - <esmDir>/foo/bar.d.ts   → <cjsDir>/foo/bar.d.cts (text-renamed)
 *
 * Relative `.js` specifiers inside both .js and .d.ts files are rewritten
 * to `.cjs` so the CJS package keeps an internally consistent graph.
 *
 * The .d.cts companions exist so consumers using the `require` exports
 * condition under moduleResolution: node16/nodenext see CJS-context type
 * declarations.
 *
 * Usage: node tools/build-cjs.ts <esm-dir> <cjs-dir>
 */
import { transformFileSync, type Options } from '@swc/core';
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

const SWC_OPTIONS: Options = {
  module: { type: 'commonjs' },
  jsc: { parser: { syntax: 'ecmascript' }, target: 'es2022' },
  sourceMaps: false,
};

// `require("./foo.js")` → `require("./foo.cjs")` in compiled CJS sources
const REWRITE_REQUIRE = /(require\(["']\.\.?\/[^"']+)\.js(["']\))/g;
// `from "./foo.js"` → `from "./foo.cjs"` in .d.ts → .d.cts conversions
const REWRITE_IMPORT = /(from\s+["']\.\.?\/[^"']+)\.js(["'])/g;

const OUTPUT_SUBDIR_TO_SKIP = 'cjs';

function* walkFiles(dir: string): Generator<string> {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    // Skip the output subdirectory if it lives under the input dir (re-runs).
    if (entry.name === OUTPUT_SUBDIR_TO_SKIP) {
      continue;
    }

    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      yield* walkFiles(fullPath);
      continue;
    }

    yield fullPath;
  }
}

function writeOutput(absPath: string, content: string): void {
  mkdirSync(dirname(absPath), { recursive: true });
  writeFileSync(absPath, content);
}

function transpileJsToCjs(absSource: string, absTarget: string): void {
  const { code } = transformFileSync(absSource, SWC_OPTIONS);

  writeOutput(absTarget, code.replace(REWRITE_REQUIRE, '$1.cjs$2'));
}

function copyDtsToDcts(absSource: string, absTarget: string): void {
  const source = readFileSync(absSource, 'utf8');

  writeOutput(absTarget, source.replace(REWRITE_IMPORT, '$1.cjs$2'));
}

function main(): void {
  const [esmDir, cjsDir] = process.argv.slice(2);

  if (!esmDir || !cjsDir) {
    console.error('Usage: node tools/build-cjs.ts <esm-dir> <cjs-dir>');
    process.exit(1);
  }

  const absEsmDir = resolve(esmDir);
  const absCjsDir = resolve(cjsDir);

  let jsCount = 0;
  let dtsCount = 0;

  for (const absInput of walkFiles(absEsmDir)) {
    const relativePath = relative(absEsmDir, absInput);

    if (absInput.endsWith('.d.ts')) {
      copyDtsToDcts(absInput, join(absCjsDir, relativePath.replace(/\.d\.ts$/, '.d.cts')));
      dtsCount++;
    } else if (absInput.endsWith('.js')) {
      transpileJsToCjs(absInput, join(absCjsDir, relativePath.replace(/\.js$/, '.cjs')));
      jsCount++;
    }
  }

  console.log(`Converted ${jsCount} ESM → CJS files and ${dtsCount} .d.ts → .d.cts into ${cjsDir}`);
}

main();
