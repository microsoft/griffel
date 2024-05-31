import { makeStyles } from '@griffel/react';
import asset from './blank.jpg';

export const useStyles = makeStyles({
  root: {
    backgroundImage: `url(${asset})`,
  },
});
