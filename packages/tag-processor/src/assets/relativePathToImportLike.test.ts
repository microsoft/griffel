import * as path from 'path';
import { relativePathToImportLike } from './relativePathToImportLike';

describe('relativePathToImportLike', () => {
  it('handles POSIX paths', () => {
    expect(
      relativePathToImportLike(
        path.posix,
        {
          root: '/home/projects/foo',
          filename: '/home/projects/foo/src/styles/Component.styles.ts',
        },
        'assets/image.png',
      ),
    ).toBe('../../assets/image.png');

    expect(
      relativePathToImportLike(
        path.posix,
        {
          root: '/home/projects/foo',
          filename: '/home/projects/foo/src/styles/Component.styles.ts',
        },
        'src/styles/Component.png',
      ),
    ).toBe('./Component.png');

    expect(
      relativePathToImportLike(
        path.posix,
        {
          root: '/home/projects/foo',
          filename: '/home/projects/foo/packages/components/src/index.styles.ts',
        },
        'packages/components/src/images/Component.png',
      ),
    ).toBe('./images/Component.png');
  });

  it('handles Windows paths', () => {
    expect(
      relativePathToImportLike(
        path.win32,
        {
          root: 'C:\\Users\\Foo\\projects',
          filename: 'C:\\Users\\Foo\\projects\\src\\styles\\Component.styles.ts',
        },
        'assets/image.png',
      ),
    ).toBe('../../assets/image.png');

    expect(
      relativePathToImportLike(
        path.win32,
        {
          root: 'C:\\Users\\Foo\\projects',
          filename: 'C:\\Users\\Foo\\projects\\src\\styles\\Component.styles.ts',
        },
        'src/styles/Component.png',
      ),
    ).toBe('./Component.png');

    expect(
      relativePathToImportLike(
        path.win32,
        {
          root: 'C:\\Users\\Foo\\projects',
          filename: 'C:\\Users\\Foo\\projects\\packages\\components\\src\\index.styles.ts',
        },
        'packages/components/src/images/Component.png',
      ),
    ).toBe('./images/Component.png');
  });
});
