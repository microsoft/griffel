import { absolutePathToRelative } from './replaceAssetsWithImports';

it('absolutePathToRelative', () => {
  expect(
    absolutePathToRelative(
      '/home/projects/foo',
      '/home/projects/foo/src/styles/Component.styles.ts',
      'assets/image.png',
    ),
  ).toBe('../../assets/image.png');

  expect(
    absolutePathToRelative(
      '/home/projects/foo',
      '/home/projects/foo/src/styles/Component.styles.ts',
      'src/styles/Component.png',
    ),
  ).toBe('./Component.png');
});
