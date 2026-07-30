import { makeStaticStyles, makeStyles } from '@griffel/react';

export const useStaticStyles = makeStaticStyles({
  body: {
    background: 'red',
  },
});

export const useStyles = makeStyles({
  root: {
    color: 'green',
  },
});
