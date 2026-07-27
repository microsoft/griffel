import { makeResetStyles, makeStyles } from '@griffel/react';

export const useStyles1 = makeStyles({
  root: { color: 'red' },
  icon: { color: 'blue' },
});
export const useStyles2 = makeStyles({
  root: { color: 'green' },
});

export const useResetStyles1 = makeResetStyles({ color: 'red' });
export const useResetStyles2 = makeResetStyles({ color: 'green' });
