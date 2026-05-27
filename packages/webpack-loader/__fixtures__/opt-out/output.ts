import { makeStyles, makeResetStyles, makeStaticStyles } from '@griffel/react';
export const useStyles = makeStyles({
  root: {
    color: 'red',
  },
});
export const useResetStyles = makeResetStyles({
  color: 'blue',
});
export const useStaticStyles = makeStaticStyles({
  body: {
    background: 'green',
  },
});
