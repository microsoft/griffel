import React from 'react';
import { makeResetStyles, mergeClasses } from '@griffel/react';

const useClassName = makeResetStyles({
  alignItems: 'stretch',
  borderWidth: '0px',
  borderStyle: 'solid',
  boxSizing: 'border-box',
  display: 'flex',
  flexBasis: 'auto',
  flexDirection: 'column',
  flexShrink: 0,
  margin: '0px',
  padding: '0px',
  position: 'relative',
  // fix flexbox bugs
  minHeight: 0,
  minWidth: 0,
});

const View: React.FC<{ className: string }> = ({ className, ...other }) => {
  return <div {...other} className={mergeClasses(useClassName(), className)} />;
};

export default View;
