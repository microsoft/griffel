import { makeStyles } from '@griffel/react';

import asset from './left.jpg';
import asset2 from './right.jpg';

export const useStyles = makeStyles({
  root: {
    backgroundImage: `url(${asset}), url(${asset2})`,
  },
});
