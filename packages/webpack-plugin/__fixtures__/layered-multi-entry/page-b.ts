import { makeStyles } from '@griffel/react';

import { useSharedStyles } from './shared';

export { useSharedStyles };

export const usePageBStyles = makeStyles({
  root: {
    '@media (min-width: 1200px)': {
      color: 'green',
    },
  },
});
