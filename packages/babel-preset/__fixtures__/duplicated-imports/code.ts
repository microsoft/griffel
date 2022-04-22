import { dupImport1 } from 'custom-package';
import { createStyles } from 'custom-package';
import { dupImport2 } from 'custom-package';

dupImport1;
dupImport2;

export const useStyles = createStyles({
  root: { color: 'red' },
});
