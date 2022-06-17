import * as React from 'react';
import { makeStyles, mergeClasses } from '../../src';

const useStyles = makeStyles({
  root: {
    color: 'deeppink',
  },
  red: {
    color: 'red',
  },
});

export const Default = () => {
  const classes = useStyles();

  return <div className={mergeClasses(classes.root, classes.red)}>no stories yet</div>;
};
