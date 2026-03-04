import { makeStyles } from '@griffel/react';

export const useClasses = makeStyles({
  root: {
    ':hover': {
      color: 'red',
    },
  },
});
