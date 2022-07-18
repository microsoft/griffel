import { makeStyles } from '@griffel/react';
import image from './blank.jpg';

export const useStyles = makeStyles({
  root: { backgroundImage: `url(${image})` },
});
