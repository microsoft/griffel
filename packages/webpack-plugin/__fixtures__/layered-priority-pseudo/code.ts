import { makeStyles } from '@griffel/react';

export const useHoverStyles = makeStyles({
  root: {
    ':hover': {
      padding: '8px',
    },
  },
});
