import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Compilation } from 'webpack';

import { createFluentOxcResolverFactory } from './createFluentOxcResolverFactory.mjs';

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
 *       raw-lib/
 *         package.json     (main points to index, both .raw.js and .js exist)
 *         index.raw.js
 *         index.js
 *       some-lib/
 *         package.json
 *         index.js
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

  // raw-lib — package where both index.raw.js and index.js exist
  writeFile(path.join(tmpDir, 'node_modules', 'raw-lib', 'index.raw.js'), 'module.exports = {};');
  writeFile(path.join(tmpDir, 'node_modules', 'raw-lib', 'index.js'), 'module.exports = {};');
  writeFile(
    path.join(tmpDir, 'node_modules', 'raw-lib', 'package.json'),
    JSON.stringify({
      name: 'raw-lib',
      main: './index',
    }),
  );

  // some-lib — a regular CJS package
  writeFile(path.join(tmpDir, 'node_modules', 'some-lib', 'index.js'), 'module.exports = {};');
  writeFile(
    path.join(tmpDir, 'node_modules', 'some-lib', 'package.json'),
    JSON.stringify({
      name: 'some-lib',
      main: './index.js',
    }),
  );
});

afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

function makeContext(id: string) {
  return { id, filename: path.join(tmpDir, 'src', 'app.js'), paths: [] };
}

describe('createFluentOxcResolverFactory', () => {
  it('returns a factory function', () => {
    const factory = createFluentOxcResolverFactory();
    expect(typeof factory).toBe('function');
  });

  it('throws for unresolvable modules', () => {
    const resolve = createFluentOxcResolverFactory()(compilationStub);
    expect(() => resolve('__nonexistent_package__', makeContext('__nonexistent_package__'))).toThrow();
  });
});

describe('resolver selection', () => {
  it('resolves FluentUI packages with ESM conditions', () => {
    const resolve = createFluentOxcResolverFactory()(compilationStub);
    const resolved = resolve('@fluentui/react-button', makeContext('@fluentui/react-button'));

    expect(resolved).toContain(path.join('lib-esm', 'index.js'));
  });

  it('resolves non-FluentUI packages with CJS conditions', () => {
    const resolve = createFluentOxcResolverFactory()(compilationStub);
    const resolved = resolve('some-lib', makeContext('some-lib'));

    expect(resolved).toContain(path.join('some-lib', 'index.js'));
  });

  it('prefers .raw.js extensions', () => {
    const resolve = createFluentOxcResolverFactory()(compilationStub);
    const resolved = resolve('raw-lib', makeContext('raw-lib'));

    expect(resolved).toContain('index.raw.js');
  });
});

describe('isFluentPackage option', () => {
  it('uses custom predicate to select ESM resolver', () => {
    const resolve = createFluentOxcResolverFactory({
      isFluentPackage: (id) => id.startsWith('some-lib'),
    })(compilationStub);

    // With default, @fluentui would get ESM — but now only some-lib is "fluent"
    const fluentResolved = resolve('@fluentui/react-button', makeContext('@fluentui/react-button'));
    expect(fluentResolved).toContain(path.join('lib', 'index.js'));
  });
});
