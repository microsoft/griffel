import { makeStyles } from '@griffel/react';

export const useStylesA = makeStyles({
  root: {
    color: 'red',
  },
});

export const useStylesB = makeStyles({
  root: {
    backgroundColor: 'green',
  },
  button: {
    border: '3px solid red',
    background: 'green',
  },
});
