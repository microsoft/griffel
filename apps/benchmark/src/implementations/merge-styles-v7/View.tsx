import React from 'react';
import { mergeStyleSets } from '@uifabric/merge-styles';

const getClassNames = () => {
  return mergeStyleSets({
    root: {
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
    },
  });
};

const View: React.FC<{ className: string }> = ({ className, ...other }) => {
  const styles = getClassNames();
  return <div {...other} className={`${styles.root} ${className}`} />;
};

export default View;
