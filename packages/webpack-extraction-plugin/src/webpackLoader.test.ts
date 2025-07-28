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

describe('webpackLoader', () => {
  it('should validate hash salt correctly', () => {
    expect(() => validateHashSalt(SOURCE_CODE, 'salt')).not.toThrow();
  });

  it('should throw an error for invalid hash salt', () => {
    expect(() => validateHashSalt(SOURCE_CODE, 'invalid-salt')).toThrowErrorMatchingInlineSnapshot(
      `"GriffelCSSExtractionPlugin: classNameHashSalt is set to \\"invalid-salt\\", but the salt location comment contains \\"salt\\". Please ensure that all files use the same salt."`,
    );
    expect(() => validateHashSalt(SOURCE_CODE, 'sal')).toThrowErrorMatchingInlineSnapshot(
      `"GriffelCSSExtractionPlugin: classNameHashSalt is set to \\"sal\\", but the salt location comment contains \\"salt\\". Please ensure that all files use the same salt."`,
    );
  });

  it('should throw if "sourceCode" does not contain a comment', () => {
    expect(() =>
      validateHashSalt('import { makeStyles } from "@griffel/react";', 'salt'),
    ).toThrowErrorMatchingInlineSnapshot(
      `"GriffelCSSExtractionPlugin: classNameHashSalt is set to \\"salt\\", but no salt location comment was found in the source code."`,
    );
  });
});
