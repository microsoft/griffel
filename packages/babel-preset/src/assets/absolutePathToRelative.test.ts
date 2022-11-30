import * as path from 'path';
import { absolutePathToRelative } from './absolutePathToRelative';

describe('absolutePathToRelative', () => {
  it('handles POSIX paths', () => {
    expect(
      absolutePathToRelative(
        path.posix,
        '/home/projects/foo',
        '/home/projects/foo/src/styles/Component.styles.ts',
        'assets/image.png',
      ),
    ).toBe('../../assets/image.png');

    expect(
      absolutePathToRelative(
        path.posix,
        '/home/projects/foo',
        '/home/projects/foo/src/styles/Component.styles.ts',
        'src/styles/Component.png',
      ),
    ).toBe('./Component.png');

    expect(
      absolutePathToRelative(
        path.posix,
        '/home/projects/foo',
        '/home/projects/foo/packages/components/src/index.styles.ts',
        'packages/components/src/images/Component.png',
      ),
    ).toBe('./images/Component.png');
  });

  it('handles Windows paths', () => {
    expect(
      absolutePathToRelative(
        path.win32,
        'C:\\Users\\Foo\\projects',
        'C:\\Users\\Foo\\projects\\src\\styles\\Component.styles.ts',
        'assets/image.png',
      ),
    ).toBe('../../assets/image.png');

    expect(
      absolutePathToRelative(
        path.win32,
        'C:\\Users\\Foo\\projects',
        'C:\\Users\\Foo\\projects\\src\\styles\\Component.styles.ts',
        'src/styles/Component.png',
      ),
    ).toBe('./Component.png');

    expect(
      absolutePathToRelative(
        path.win32,
        'C:\\Users\\Foo\\projects',
        'C:\\Users\\Foo\\projects\\packages\\components\\src\\index.styles.ts',
        'packages/components/src/images/Component.png',
      ),
    ).toBe('./images/Component.png');
  });
});
