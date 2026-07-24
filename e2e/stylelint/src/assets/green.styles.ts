import { makeStyles } from '@griffel/react';

// A valid file: no rules from `.stylelintrc.json` are violated, so stylelint
// should report no problems for the CSS generated from this file.
export const useStyles = makeStyles({
  root: {
    color: 'red',
    backgroundColor: 'green',
  },
});
