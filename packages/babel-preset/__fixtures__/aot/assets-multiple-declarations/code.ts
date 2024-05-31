import { makeStyles } from '@griffel/react';

import blank from './blank.jpg';
import empty from './empty.jpg';

export const useStyles = makeStyles({
  root: { backgroundImage: `url(${blank}), url(${empty})` },
});
