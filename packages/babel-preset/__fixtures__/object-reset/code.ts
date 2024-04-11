import { makeStyles } from '@griffel/react';

export const RESET = 'DO_NOT_USE_DIRECTLY: @griffel/reset-value' as unknown as 'unset';

export const useStyles = makeStyles({
  root: { color: 'red', paddingLeft: RESET },
  icon: { color: RESET },
});
