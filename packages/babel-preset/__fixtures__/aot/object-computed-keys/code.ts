import { makeStyles } from '@griffel/react';

const rootSlot = 'root';

export const useStyles = makeStyles({
  [rootSlot]: { color: 'red', paddingLeft: '4px' },
  [rootSlot + 'primary']: { backgroundColor: 'green', marginLeft: '4px' },
});
