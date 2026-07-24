import { makeStyles } from '@griffel/react';

// Same violation as `error.styles.ts`, but the `griffel-csslint-disable` comment
// directive on the slot instructs the Griffel PostCSS syntax to emit a
// `/* stylelint-disable-line selector-anb-no-unmatchable */` comment for this
// slot's generated CSS, so stylelint should report no problems.
export const useStyles = makeStyles({
  // griffel-csslint-disable selector-anb-no-unmatchable
  root: {
    ':nth-child(0)': {
      color: 'red',
    },
  },
});
