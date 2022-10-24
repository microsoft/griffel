import * as React from 'react';
import { StyleFunction, useFela } from 'react-fela';

type BoxProps = {
  color: number;
  layout: string;
  fixed: boolean;
  outer: boolean;
};

const rule: StyleFunction<{}, BoxProps> = ({ color, fixed = false, layout = 'column', outer = false }) => ({
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
  ...styles[`color${color}` as keyof typeof styles],
  ...(fixed && styles.fixed),
  ...(layout === 'row' && styles.row),
  ...(outer && styles.outer),
});

const Box: React.FC<React.PropsWithChildren<BoxProps>> = ({ children, color, fixed, layout, outer }) => {
  const { css } = useFela({ color, fixed, layout, outer });

  return <div className={css(rule)}>{children}</div>;
};

const styles = {
  outer: {
    alignSelf: 'flex-start',
    padding: '4px',
  },
  row: {
    flexDirection: 'row',
  },
  color0: {
    backgroundColor: '#14171A',
  },
  color1: {
    backgroundColor: '#AAB8C2',
  },
  color2: {
    backgroundColor: '#E6ECF0',
  },
  color3: {
    backgroundColor: '#FFAD1F',
  },
  color4: {
    backgroundColor: '#F45D22',
  },
  color5: {
    backgroundColor: '#E0245E',
  },
  fixed: {
    width: '6px',
    height: '6px',
  },
};

export default Box;
