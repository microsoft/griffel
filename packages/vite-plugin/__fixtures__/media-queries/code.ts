import { makeStyles } from '@griffel/react';

export const useStyles = makeStyles({
  root: {
    '@media (min-width: 900px)': {
      color: 'green',
    },
    '@media (min-width: 100px)': {
      color: 'red',
    },
  },
});
