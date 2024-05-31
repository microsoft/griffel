import { makeStyles, makeResetStyles } from '@griffel/react';

export const useClasses = makeStyles({
  root: { color: 'red' },
});

export const useClassName = makeResetStyles({
  color: 'red',
  paddingLeft: '4px',
});
