import { makeStyles } from '@griffel/react';
import { sharedStyles } from './mixins';

export const useStyles = makeStyles({
  ...sharedStyles,
  icon: { color: 'red' },
});
