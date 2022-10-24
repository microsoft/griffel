import * as React from 'react';
import { StyleFunction, useFela } from 'react-fela';

type DotProps = {
  color: string;
  size: number;
  x: number;
  y: number;
};

const rule: StyleFunction<{}, DotProps> = ({ size, x, y, color }) => ({
  position: 'absolute',
  cursor: 'pointer',
  width: 0,
  height: 0,
  borderColor: 'transparent',
  borderStyle: 'solid',
  borderTopWidth: 0,
  transform: 'translate(50%, 50%)',
  borderBottomColor: color,
  borderRightWidth: `${size! / 2}px`,
  borderBottomWidth: `${size! / 2}`,
  borderLeftWidth: `${size! / 2}`,
  marginLeft: `${x}px`,
  marginTop: `${y}px`,
});

const Dot: React.FC<React.PropsWithChildren<DotProps>> = ({ size, x, y, color, children }) => {
  const { css } = useFela<{}, DotProps>({ size, x, y, color });

  return <div className={css(rule)}>{children}</div>;
};

export default Dot;
