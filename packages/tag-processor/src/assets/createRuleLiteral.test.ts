import { types as t } from '@babel/core';
import generate from '@babel/generator';
import * as path from 'path';

import type { FileContext } from '../types';
import { createRuleLiteral } from './createRuleLiteral';

const fileContextPosix: FileContext = {
  root: '/home/projects/foo',
  filename: '/home/projects/foo/src/styles/Component.styles.ts',
};
const fileContextWin32: FileContext = {
  root: 'C:\\Users\\Foo\\projects',
  filename: 'C:\\Users\\Foo\\projects\\src\\styles\\Component.styles.ts',
};

describe('createRuleLiteral', () => {
  it('creates strings for rules', () => {
    const addAssetImport = jest.fn();

    const node = createRuleLiteral(path.posix, t, fileContextPosix, '.foo { color: red }', addAssetImport);
    const { code } = generate(node);

    expect(code).toMatchInlineSnapshot(`"\\".foo { color: red }\\""`);
    expect(addAssetImport).not.toHaveBeenCalled();
  });

  describe('updates URLs that start with "griffel"', () => {
    it('posix', () => {
      const addAssetImport = jest.fn().mockImplementation(() => t.identifier('foo'));

      const node = createRuleLiteral(
        path.posix,
        t,
        fileContextPosix,
        '.foo { url(griffel:assets/foo.png) }',
        addAssetImport,
      );
      const { code } = generate(node);

      expect(code).toMatchInlineSnapshot(`"\`.foo { url(\${foo}) }\`"`);
      expect(addAssetImport).toHaveBeenCalledWith('../../assets/foo.png');
    });

    it('win32', () => {
      const addAssetImport = jest.fn().mockImplementation(() => t.identifier('foo'));

      const node = createRuleLiteral(
        path.win32,
        t,
        fileContextWin32,
        '.foo { url(griffel:assets/foo.png) }',
        addAssetImport,
      );
      const { code } = generate(node);

      expect(code).toMatchInlineSnapshot(`"\`.foo { url(\${foo}) }\`"`);
      expect(addAssetImport).toHaveBeenCalledWith('../../assets/foo.png');
    });
  });
});
