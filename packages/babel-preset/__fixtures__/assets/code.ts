import { makeStyles } from '@griffel/react';

import blank from './blank.jpg';
import blankDuplicate from './blank.jpg';
import empty from './empty.jpg';

export const useStyles = makeStyles({
  rootA: { backgroundImage: `url(${blank})` },
  rootB: { backgroundImage: `url(${blankDuplicate})` },
  rootC: { backgroundImage: `url(${empty})` },
});
