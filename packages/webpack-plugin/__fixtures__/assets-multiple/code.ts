import { makeStyles } from '@griffel/react';
import _asset from './blank.jpg';
import _asset2 from './empty.jpg';

export const useStyles = makeStyles({
  root: {
    backgroundImage: `url(${_asset}), url(${_asset2})`,
  },
});
