import * as React from 'react';
import { makeStyles, shorthands } from '@griffel/react';

const useStyles = makeStyles({
  root: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    gridGap: '3px',
    ...shorthands.margin('5px'),
  },
  icon: {
    textDecorationLine: 'none',
    position: 'relative',
    top: '-5px',
  },
  text: {
    '::after': {
      content: '""',

      display: 'block',
      height: '100%',
      width: 'calc(100% + 5px)',

      position: 'relative',
      top: 'calc(-100%)',
      left: '-10px',
      zIndex: -1,
      ...shorthands.border('1px', 'dotted', 'deepskyblue'),
    },
  },
});

export const DefaultMessage: React.FC = () => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <u aria-hidden className={classes.icon}>
        💡️
      </u>
      <div className={classes.text}>
        Please select an element with styles created by <code>makeStyles()</code>.
      </div>
    </div>
  );
};
