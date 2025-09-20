import { makeResetStyles } from '@griffel/react';

import blank from './blank.jpg';
import blankDuplicate from './blank.jpg';
import empty from './empty.jpg';

export const useStyles = makeResetStyles({
  backgroundImage: `url(${blank})`,
  ':hover': { backgroundImage: `url(${blankDuplicate})` },
  ':focus': { backgroundImage: `url(${empty})` },
});
