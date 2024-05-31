import { makeStyles } from '@griffel/react';
import { createMixin } from './mixins';

export const useStyles = makeStyles({
  avatar: createMixin({ display: 'block', opacity: '0' }),
});
