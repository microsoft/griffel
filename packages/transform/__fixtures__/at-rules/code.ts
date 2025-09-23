import { makeStyles } from '@griffel/react';

export const useStyles = makeStyles({
  root: {
    '@media (min-width: 600px)': {
      paddingLeft: '4px',
      paddingRight: '4px',
    },
    '@supports (display: flex)': {
      paddingLeft: '4px',
      paddingRight: '4px',
    },
  },
});
