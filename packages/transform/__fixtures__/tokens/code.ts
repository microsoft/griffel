import { makeStyles } from '@griffel/react';
import { customTokens } from './tokens';

export const useStyles = makeStyles({
  root: {
    backgroundColor: 'black',
    color: customTokens.colorPaletteBlueBorder2,
    display: 'flex',
  },
  rootPrimary: { color: customTokens.colorBrandBackground },
});
