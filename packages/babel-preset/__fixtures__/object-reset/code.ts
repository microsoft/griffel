import { makeStyles } from '@griffel/react';

export const UNSET = 'DO_NOT_USE_DIRECTLY: @griffel/unset' as unknown as 'unset';

export const useStyles = makeStyles({
  root: { color: 'red', paddingLeft: UNSET },
  icon: { color: UNSET },
});
