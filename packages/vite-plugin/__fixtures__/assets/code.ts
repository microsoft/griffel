import { makeStyles } from '@griffel/react';
import _asset from './blank.jpg';

export const useStyles = makeStyles({
  root: {
    backgroundImage: `url(${_asset})`,
  },
});
