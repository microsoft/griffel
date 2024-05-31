import { makeStyles } from '@griffel/react';

export const styles = makeStyles({
  root: {
    color: 'red',
    paddingLeft: '4px',
  },
  button: {
    border: '3px solid red',
    background: 'green',
  },
  icon: {
    backgroundColor: 'green',
    ':hover': {
      color: 'red',
    },
  },
});
