import { makeStyles } from '@griffel/react';
import asset from './blank.jpg';
import asset2 from './empty.jpg';

export const useStyles = makeStyles({
  root: {
    backgroundImage: `url(${asset}), url(${asset2})`,
  },
});
