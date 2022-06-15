import React from 'react';

const compose = (s1: React.CSSProperties, s2: React.CSSProperties) => {
  if (s1 && s2) {
    return { ...s1, ...s2 };
  } else {
    return s1 || s2;
  }
};

const View: React.FC<{ style: React.CSSProperties }> = ({ style, ...other }) => {
  return <div {...other} style={compose(viewStyle, style)} />;
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
} as React.CSSProperties;

export default View;
