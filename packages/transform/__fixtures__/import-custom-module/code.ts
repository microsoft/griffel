// @ts-expect-error This module does not exist, but will be resolved via aliases
import { makeStyles } from 'custom-package';

export const useStyles = makeStyles({
  root: { color: 'red' },
});
