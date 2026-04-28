import { makeStyles } from '@griffel/react';

export const useStyles = makeStyles({
  root: {
    color: 'red',
    '@scope to (.boundary)': {
      ':hover': { color: 'cyan' },
      '& p': { color: 'red' },
    },
  },
});
