import { makeStyles } from '@griffel/react';

export const useStyles = makeStyles({
  media: {
    '@media screen and (max-width: 100px)': {
      color: 'red',
    },
  },
});
