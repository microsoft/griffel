import { makeStyles } from '@griffel/react';
import { className, selector } from './consts';

export const useStyles = makeStyles({
  root: {
    [selector]: { color: 'red' },
    [`& .${className}`]: { color: 'blue' },
  },
});
