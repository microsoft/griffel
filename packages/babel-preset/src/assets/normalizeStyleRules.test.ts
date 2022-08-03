import * as path from 'path';
import { normalizeStyleRule, normalizeStyleRules } from './normalizeStyleRules';

describe('normalizeStyleRule', () => {
  it('handles rules without quotes', () => {
    expect(
      normalizeStyleRule(
        path.posix,
        '/home/projects/foo',
        '/home/projects/foo/src/styles/Component.styles.ts',
        'url(../../assets/image.png)',
      ),
    ).toBe('url(assets/image.png)');
  });

  it('handles rules with quotes', () => {
    expect(
      normalizeStyleRule(
        path.posix,
        '/home/projects/foo',
        '/home/projects/foo/src/styles/Component.styles.ts',
        "url('../../assets/image.png')",
      ),
    ).toBe('url(assets/image.png)');
    expect(
      normalizeStyleRule(
        path.posix,
        '/home/projects/foo',
        '/home/projects/foo/src/styles/Component.styles.ts',
        'url("../../assets/image.png")',
      ),
    ).toBe('url(assets/image.png)');
  });

  it('keeps data-url', () => {
    expect(
      normalizeStyleRule(
        path.posix,
        '/home/projects/foo',
        '/home/projects/foo/src/styles/Component.styles.ts',
        'url(data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2Q==)',
      ),
    ).toBe('url(data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2Q==)');
  });

  it('handles Windows paths', () => {
    expect(
      normalizeStyleRule(
        path.win32,
        'C:\\Users\\Foo\\projects\\bar',
        'C:\\Users\\Foo\\projects\\bar\\src\\styles\\Component.styles.ts',
        'url(../../assets/image.png)',
      ),
    ).toBe('url(assets/image.png)');
  });
});

describe('normalizeStyleRules', () => {
  it('handles rules without metadata', () => {
    expect(
      normalizeStyleRules(
        path.posix,
        '/home/projects/foo',
        '/home/projects/foo/src/styles/Component.styles.ts',

        {
          root: {
            color: 'red',
            backgroundImage: 'url(../../assets/image.jpg)',
            overflowY: ['hidden', 'scroll'],

            ':hover': {
              backgroundImage: 'url(../../assets/hoverImage.jpg)',
            },

            '@media screen and (max-width: 100px)': {
              '& .foo': {
                backgroundImage: 'url(../../assets/mediaImage.jpg)',
              },
            },
          },
        },
      ),
    ).toEqual({
      root: {
        color: 'red',
        backgroundImage: 'url(assets/image.jpg)',
        overflowY: ['hidden', 'scroll'],

        ':hover': {
          backgroundImage: 'url(assets/hoverImage.jpg)',
        },

        '@media screen and (max-width: 100px)': {
          '& .foo': {
            backgroundImage: 'url(assets/mediaImage.jpg)',
          },
        },
      },
    });
  });
});
