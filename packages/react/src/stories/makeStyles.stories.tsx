import * as React from 'react';
import { makeStyles } from '../../src';

const useStyles = makeStyles({
  root: {
    color: 'deeppink',
  },
});

export const Default = () => {
  const classes = useStyles();

  return <div className={classes.root}>no stories yet</div>;
};

export { ComponentStyles } from './ComponentStyles.stories';

export default {
  title: 'makeStyles',
};
