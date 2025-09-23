// @ts-expect-error This module does not exist, but will be resolved via aliases
import { createStyles } from 'custom-package';

export const useStyles = createStyles({
  root: { color: 'red' },
});
