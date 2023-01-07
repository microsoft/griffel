import { makeStyles } from '@griffel/react';
import * as React from 'react';

const useStyles = makeStyles({
  root: { color: 'red' },
});

export default function Component() {
  const classes = useStyles();

  return React.createElement('div', { className: classes.root });
}
