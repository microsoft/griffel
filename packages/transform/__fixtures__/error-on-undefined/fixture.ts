import { makeStyles } from '@griffel/react';
// @ts-expect-error This module does not have exported member 'colors'
import { colors } from './tokens';

export const useClassesA = makeStyles({
  root: { color: colors.foreground },
});
