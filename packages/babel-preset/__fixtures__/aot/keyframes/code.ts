import { makeStyles } from '@griffel/react';

export const useStyles = makeStyles({
  single: {
    animationName: {
      from: { transform: 'rotate(0deg)' },
      to: { transform: 'rotate(360deg)' },
    },
  },
  multiple: {
    animationName: [
      {
        from: { transform: 'rotate(0deg)' },
        to: { transform: 'rotate(360deg)' },
      },
      {
        from: { height: '100px' },
        to: { height: '200px' },
      },
    ],
  },
});
