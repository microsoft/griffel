import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Compilation } from 'webpack';

import { createResolverFactory } from './createResolverFactory.mjs';

const compilationStub = {} as Compilation;

/**
 * Creates a temporary directory with a fake node_modules structure.
 *
 * Layout:
 *   <tmpDir>/
 *     src/
 *       app.js
 *     node_modules/
 *       @fluentui/
 *         react-button/
 *           package.json   (with CJS and ESM exports via conditions)
 *           lib/
 *             index.js
 *           lib-esm/
 *             index.js
 *       some-lib/
 *         package.json
 *         index.js
 *       tslib/
 *         package.json     (CJS-only exception)
 *         tslib.js
 *         tslib.es6.js
 *       @babel/
 *         helpers/
 *           package.json   (CJS-only exception)
 *           lib/
 *             index.js
 *           esm/
 *             index.js
 *       @swc/
 *         helpers/
 *           package.json   (CJS-only exception)
 *           cjs/
 *             index.cjs
 *           esm/
 *             index.js
 */
let tmpDir: string;

function writeFile(filePath: string, content: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content);
}

beforeAll(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'griffel-resolver-test-'));

  // Source file that "imports" things
  writeFile(path.join(tmpDir, 'src', 'app.js'), '');

  // @fluentui/react-button — package with CJS and ESM exports via conditions
  writeFile(path.join(tmpDir, 'node_modules', '@fluentui', 'react-button', 'lib', 'index.js'), 'module.exports = {};');
  writeFile(
    path.join(tmpDir, 'node_modules', '@fluentui', 'react-button', 'lib-esm', 'index.js'),
    'export default {};',
  );
  writeFile(
    path.join(tmpDir, 'node_modules', '@fluentui', 'react-button', 'package.json'),
    JSON.stringify({
      name: '@fluentui/react-button',
      main: './lib/index.js',
      exports: {
        '.': {
          import: './lib-esm/index.js',
          require: './lib/index.js',
        },
      },
    }),
  );

  // some-lib — a regular package
  writeFile(path.join(tmpDir, 'node_modules', 'some-lib', 'index.js'), 'module.exports = {};');
  writeFile(
    path.join(tmpDir, 'node_modules', 'some-lib', 'package.json'),
    JSON.stringify({
      name: 'some-lib',
      main: './index.js',
    }),
  );

  // tslib — CJS-only exception
  writeFile(path.join(tmpDir, 'node_modules', 'tslib', 'tslib.js'), 'module.exports = {};');
  writeFile(path.join(tmpDir, 'node_modules', 'tslib', 'tslib.es6.js'), 'export {};');
  writeFile(
    path.join(tmpDir, 'node_modules', 'tslib', 'package.json'),
    JSON.stringify({
      name: 'tslib',
      main: './tslib.js',
      exports: {
        '.': {
          import: './tslib.es6.js',
          require: './tslib.js',
        },
      },
    }),
  );

  // @babel/helpers — CJS-only exception
  writeFile(path.join(tmpDir, 'node_modules', '@babel', 'helpers', 'lib', 'index.js'), 'module.exports = {};');
  writeFile(path.join(tmpDir, 'node_modules', '@babel', 'helpers', 'esm', 'index.js'), 'export {};');
  writeFile(
    path.join(tmpDir, 'node_modules', '@babel', 'helpers', 'package.json'),
    JSON.stringify({
      name: '@babel/helpers',
      main: './lib/index.js',
      exports: {
        '.': {
          import: './esm/index.js',
          require: './lib/index.js',
        },
      },
    }),
  );

  // @swc/helpers — CJS-only exception
  writeFile(path.join(tmpDir, 'node_modules', '@swc', 'helpers', 'cjs', 'index.cjs'), 'module.exports = {};');
  writeFile(path.join(tmpDir, 'node_modules', '@swc', 'helpers', 'esm', 'index.js'), 'export {};');
  writeFile(
    path.join(tmpDir, 'node_modules', '@swc', 'helpers', 'package.json'),
    JSON.stringify({
      name: '@swc/helpers',
      main: './cjs/index.cjs',
      exports: {
        '.': {
          import: './esm/index.js',
          require: './cjs/index.cjs',
        },
      },
    }),
  );
});

afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function makeContext(id: string) {
  return { id, filename: path.join(tmpDir, 'src', 'app.js'), paths: [] };
}

describe('createResolverFactory', () => {
  it('returns a factory function', () => {
    const factory = createResolverFactory();
    expect(typeof factory).toBe('function');
  });

  it('throws for unresolvable modules', () => {
    const resolve = createResolverFactory()(compilationStub);
    expect(() => resolve('__nonexistent_package__', makeContext('__nonexistent_package__'))).toThrow();
  });
});

describe('resolver selection', () => {
  it('resolves packages with ESM conditions by default', () => {
    const resolve = createResolverFactory()(compilationStub);
    const resolved = resolve('@fluentui/react-button', makeContext('@fluentui/react-button'));

    expect(resolved).toContain(path.join('lib-esm', 'index.js'));
  });
});

describe('CJS-only exceptions', () => {
  it('resolves tslib with CJS conditions', () => {
    const resolve = createResolverFactory()(compilationStub);
    const resolved = resolve('tslib', makeContext('tslib'));

    expect(resolved).toContain('tslib.js');
    expect(resolved).not.toContain('es6');
  });

  it('resolves @babel/helpers with CJS conditions', () => {
    const resolve = createResolverFactory()(compilationStub);
    const resolved = resolve('@babel/helpers', makeContext('@babel/helpers'));

    expect(resolved).toContain(path.join('lib', 'index.js'));
  });

  it('resolves @swc/helpers with CJS conditions', () => {
    const resolve = createResolverFactory()(compilationStub);
    const resolved = resolve('@swc/helpers', makeContext('@swc/helpers'));

    expect(resolved).toContain(path.join('cjs', 'index.cjs'));
  });
});
