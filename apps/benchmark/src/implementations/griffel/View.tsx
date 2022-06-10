import React from 'react';
import { makeStyles, shorthands, mergeClasses } from '@griffel/react';

const useStyles = makeStyles({
  root: {
    alignItems: 'stretch',
    ...shorthands.borderWidth('0px'),
    ...shorthands.borderStyle('solid'),
    boxSizing: 'border-box',
    display: 'flex',
    flexBasis: 'auto',
    flexDirection: 'column',
    flexShrink: 0,
    ...shorthands.margin('0px'),
    ...shorthands.padding('0px'),
    position: 'relative',
    // fix flexbox bugs
    minHeight: 0,
    minWidth: 0,
  },
});

const View: React.FC<{ className: string }> = ({ className, ...other }) => {
  const styles = useStyles();
  return <div {...other} className={mergeClasses(styles.root, className)} />;
};

export default View;
