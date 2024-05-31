import { makeStyles } from '@griffel/react';

export const styles = makeStyles({
  root: {
    color: 'red',
    paddingLeft: '4px',
  },
  icon: {
    backgroundColor: 'green',
    ':hover': {
      color: 'red',
    },
  },
});
