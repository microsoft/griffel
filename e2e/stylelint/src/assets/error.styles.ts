import { makeStyles } from '@griffel/react';

// An invalid file: `:nth-child(0)` is an unmatchable An+B selector, so stylelint
// should report the `selector-anb-no-unmatchable` rule for the generated CSS.
export const useStyles = makeStyles({
  root: {
    ':nth-child(0)': {
      color: 'red',
    },
  },
});
