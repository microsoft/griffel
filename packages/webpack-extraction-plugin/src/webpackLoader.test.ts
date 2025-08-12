import { validateHashSalt } from './webpackLoader';

const SOURCE_CODE = `import { makeStyles } from '@griffel/react';

export const useStyles = makeStyles({
  root: {
    color: 'red',
    paddingLeft: '4px',
    paddingRight: '4px',
  },
});
/*@griffel:classNameHashSalt "salt"*/
`;

const FILE_PATH = 'c:\\repo\\node_modules\\some-package\\file.js';

describe('webpackLoader', () => {
  it('should validate hash salt correctly', () => {
    expect(() => validateHashSalt(FILE_PATH, SOURCE_CODE, 'salt', undefined /* classNameHashFilter */)).not.toThrow();
  });

  it('should throw an error for invalid hash salt', () => {
    expect(() =>
      validateHashSalt(FILE_PATH, SOURCE_CODE, 'invalid-salt', undefined /* classNameHashFilter */),
    ).toThrowErrorMatchingInlineSnapshot(
      `"GriffelCSSExtractionPlugin: classNameHashSalt is set to \\"invalid-salt\\", but the salt location comment in \\"c:/repo/node_modules/some-package/file.js\\" contains \\"salt\\". Please ensure that all files use the same salt."`,
    );
    expect(() =>
      validateHashSalt(FILE_PATH, SOURCE_CODE, 'sal', undefined /* classNameHashFilter */),
    ).toThrowErrorMatchingInlineSnapshot(
      `"GriffelCSSExtractionPlugin: classNameHashSalt is set to \\"sal\\", but the salt location comment in \\"c:/repo/node_modules/some-package/file.js\\" contains \\"salt\\". Please ensure that all files use the same salt."`,
    );
  });

  it('should throw if "sourceCode" does not contain a comment', () => {
    expect(() =>
      validateHashSalt(
        FILE_PATH,
        'import { makeStyles } from "@griffel/react";',
        'salt',
        undefined /* classNameHashFilter */,
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `"GriffelCSSExtractionPlugin: classNameHashSalt is set to \\"salt\\", but no salt location comment was found in the source code of \\"c:/repo/node_modules/some-package/file.js\\"."`,
    );
  });

  it('should throw if "sourceCode" does not contain a comment, AND the classNameHashFilter returns true for the file', () => {
    expect(() =>
      validateHashSalt(FILE_PATH, 'import { makeStyles } from "@griffel/react";', 'salt', path => {
        if (path.endsWith('someOtherFile.js')) {
          // Skip validation for the other file
          return false;
        }
        return true;
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      `"GriffelCSSExtractionPlugin: classNameHashSalt is set to \\"salt\\", but no salt location comment was found in the source code of \\"c:/repo/node_modules/some-package/file.js\\"."`,
    );
  });

  it('should NOT throw when an otherwise-throwing case (e.g., "sourceCode" does not contain a comment) is being filtered out by the classNameHashFilter', () => {
    expect(() =>
      validateHashSalt(FILE_PATH, 'import { makeStyles } from "@griffel/react";', 'salt', path => {
        if (path.endsWith('/file.js')) {
          // Skip validation for this file
          return false;
        }
        return true;
      }),
    ).not.toThrow();
  });
});
