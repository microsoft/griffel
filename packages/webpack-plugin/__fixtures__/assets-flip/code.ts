import { makeStyles } from '@griffel/react';

import _asset from './left.jpg';
import _asset2 from './right.jpg';

export const useStyles = makeStyles({
  root: {
    backgroundImage: `url(${_asset}), url(${_asset2})`,
  },
});
