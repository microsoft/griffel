import { makeStyles } from '@griffel/react';
import { tokens } from './tokens';

export const useStyles = makeStyles({
  root: {
    backgroundColor: 'black',
    color: tokens.colorPaletteBlueBorder2,
    display: 'flex',
  },
  rootPrimary: { color: tokens.colorBrandBackground },
});
