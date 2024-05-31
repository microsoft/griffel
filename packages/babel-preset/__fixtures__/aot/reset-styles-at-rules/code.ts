import { makeResetStyles } from '@griffel/react';

export const useStyles = makeResetStyles({
  color: 'red',
  '@supports (display: flex)': { color: 'pink' },
  '@media (min-width: 100px)': { color: 'blue' },
});
