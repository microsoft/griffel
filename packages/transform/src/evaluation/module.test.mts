import * as fs from 'node:fs';
import NativeModule from 'node:module';
import * as os from 'node:os';
import * as path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import { ASSET_TAG_OPEN, ASSET_TAG_CLOSE } from '../constants.mjs';
import { Module } from './module.mjs';
import type { TransformResolver } from './module.mjs';

const defaultRules = [{ action: 'ignore' as const }];
const defaultResolve: TransformResolver = (id, opts) =>
  (NativeModule as unknown as { _resolveFilename: (id: string, options: unknown) => string })._resolveFilename(id, opts);

describe('Module', () => {
  let tmpDir: string;

  afterEach(() => {
    Module.invalidate();

    if (tmpDir) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
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
