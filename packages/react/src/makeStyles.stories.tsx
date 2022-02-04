import * as React from 'react';
import { createDOMRenderer, RendererProvider, makeStyles } from '../src';

const useStyles = makeStyles({
  root: {
    color: 'deeppink',
  },
});

const domRenderer = createDOMRenderer();

export const Default = () => {
  const classes = useStyles();

  return (
    <RendererProvider renderer={domRenderer}>
      <div className={classes.root}>no stories yet</div>
    </RendererProvider>
  );
};

export default {
  title: 'makeStyles',
};
