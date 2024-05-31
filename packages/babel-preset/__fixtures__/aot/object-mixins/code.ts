import { makeStyles } from '@griffel/react';
import { flexStyles, gridStyles, typography } from './mixins';

export const useStyles = makeStyles({
  root: flexStyles,
  label: typography.text,
  header: typography.header,

  icon: { ...flexStyles, color: 'red' },
  image: { ...gridStyles('10px'), color: 'green' },
});
