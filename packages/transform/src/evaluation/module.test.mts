import * as fs from 'node:fs';
import NativeModule from 'node:module';
import * as os from 'node:os';
import * as path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { ASSET_TAG_OPEN, ASSET_TAG_CLOSE } from '../constants.mjs';
import { Module } from './module.mjs';
import type { TransformResolver } from './module.mjs';

const defaultRules = [{ action: 'ignore' as const }];
const defaultResolve: TransformResolver = (id, opts) => ({
  path: (NativeModule as unknown as { _resolveFilename: (id: string, options: unknown) => string })._resolveFilename(
    id,
    opts,
  ),
  builtin: false,
});

describe('Module', () => {
  let tmpDir: string;

  afterEach(() => {
    Module.invalidate();

    if (tmpDir) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  describe('evaluate', () => {
    it('wraps VM errors as host Error with filename context', () => {
      tmpDir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'griffel-module-test-')));

      const childFile = path.join(tmpDir, 'child.js');
      fs.writeFileSync(childFile, 'const x = undefined;\nx.foo;');

      const entryFile = path.join(tmpDir, 'entry.js');
      fs.writeFileSync(entryFile, '');

      const m = new Module(entryFile, defaultRules, defaultResolve);

      try {
        m.evaluate(`const child = require("./child.js");`, ['child']);
        expect.unreachable('should have thrown');
      } catch (e) {
        // Must be a proper host Error instance (not a VM context Error that webpack wraps as NonErrorEmittedError)
        expect(e).toBeInstanceOf(Error);

        const err = e as Error;
        // Replace machine-specific paths and line numbers so snapshots are stable across environments
        const repoRoot = path.resolve(__dirname, '../../../..');
        const normalize = (s: string) =>
          s
            .split(tmpDir).join('<tmpDir>')
            .split(repoRoot).join('<repo>')
            .replace(/:\d+(:\d+)?/g, ':<line>');

        expect(normalize(err.message)).toMatchInlineSnapshot(
          `"Cannot read properties of undefined (reading 'foo')"`,
        );
        expect(normalize(err.stack!)).toMatchInlineSnapshot(`
          "<repo>/packages/transform/src/evaluation/module.mts:<line>
                throw hostError;
                ^

          <tmpDir>/child.js:<line>
          x.foo;
            ^

          TypeError: Cannot read properties of undefined (reading 'foo')
              at <tmpDir>/child.js:<line>
              at <tmpDir>/child.js:<line>
              at Script.runInContext (node:vm:<line>)
              at Module.evaluate (<repo>/packages/transform/src/evaluation/module.mts:<line>)
              at require.Object.assign.ensure (<repo>/packages/transform/src/evaluation/module.mts:<line>)
              at <tmpDir>/entry.js:<line>
              at <tmpDir>/entry.js:<line>
              at Script.runInContext (node:vm:<line>)
              at Module.evaluate (<repo>/packages/transform/src/evaluation/module.mts:<line>)
              at <repo>/packages/transform/src/evaluation/module.test.mts:<line>"
        `);
      }
    });
  });

  describe('require (asset handling)', () => {
    it('wraps non-JS/JSON requires with asset tags containing absolute path', () => {
      tmpDir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'griffel-module-test-')));

      const jpgFile = path.join(tmpDir, 'test.jpg');
      fs.writeFileSync(jpgFile, '');

      const entryFile = path.join(tmpDir, 'entry.js');
      fs.writeFileSync(entryFile, '');

      const m = new Module(entryFile, defaultRules, defaultResolve);
      const result = m.require('./test.jpg');

      expect(result).toBe(ASSET_TAG_OPEN + jpgFile + ASSET_TAG_CLOSE);
    });

    it('wraps .png requires with asset tags', () => {
      tmpDir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'griffel-module-test-')));

      const pngFile = path.join(tmpDir, 'icon.png');
      fs.writeFileSync(pngFile, '');

      const entryFile = path.join(tmpDir, 'entry.js');
      fs.writeFileSync(entryFile, '');

      const m = new Module(entryFile, defaultRules, defaultResolve);
      const result = m.require('./icon.png');

      expect(result).toBe(ASSET_TAG_OPEN + pngFile + ASSET_TAG_CLOSE);
    });

    it('does not wrap .json requires with asset tags', () => {
      tmpDir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'griffel-module-test-')));

      const jsonFile = path.join(tmpDir, 'data.json');
      fs.writeFileSync(jsonFile, '{"key": "value"}');

      const entryFile = path.join(tmpDir, 'entry.js');
      fs.writeFileSync(entryFile, '');

      const m = new Module(entryFile, defaultRules, defaultResolve);
      const result = m.require('./data.json');

      expect(result).toEqual({ key: 'value' });
    });
  });
});
