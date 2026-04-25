import { makeStyles } from '@griffel/react';

import { useSharedStyles } from './shared';

export { useSharedStyles };

export const usePageAStyles = makeStyles({
  root: {
    '@media (min-width: 800px)': {
      color: 'red',
    },
  },
});
