import { mergeStyles, IStyle } from '@uifabric/merge-styles';
import * as React from 'react';

const getClassName = (customStyles: IStyle) => {
  return mergeStyles([
    // @ts-expect-error Typings of v7 are not compatible with latest TS
    {
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
    customStyles,
  ]);
};

const View: React.FC<{ styles: IStyle }> = ({ styles, ...other }) => {
  const className = getClassName(styles);

  return <div {...other} className={className} />;
};

export default View;
