import { makeStyles } from '@griffel/react';

export const stylesA = makeStyles({
  root: {
    color: 'red',
  },
});

export const stylesB = makeStyles({
  root: {
    backgroundColor: 'green',
  },
  button: {
    border: '3px solid red',
    background: 'green',
  },
});
