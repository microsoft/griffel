import { css } from '@emotion/css';
import React from 'react';

const View: React.FC<{ style: any }> = ({ style = [], ...rest }) => {
  return <div {...rest} className={css([viewStyle, ...style])} />;
};

const viewStyle = {
  alignItems: 'stretch',
  borderWidth: 0,
  borderStyle: 'solid',
  boxSizing: 'border-box',
  display: 'flex',
  flexBasis: 'auto',
  flexDirection: 'column',
  flexShrink: 0,
  margin: 0,
  padding: 0,
  position: 'relative',
  // fix flexbox bugs
  minHeight: 0,
  minWidth: 0,
};

export default View;
