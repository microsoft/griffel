import { dupImport1 } from 'custom-package';
import { createStyles } from 'custom-package';
import { dupImport2 } from 'another-custom-package';
import { otherImport } from 'another-package';

dupImport1;
dupImport2;
otherImport;

export const useStyles = createStyles({
  root: { color: 'red' },
});
