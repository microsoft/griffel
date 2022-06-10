import React from 'react';
import { DotProps } from '../types';

const Dot: React.FC<DotProps> = ({ size, x, y, children, color }) => (
  <div
    style={{
      ...styles.root,
      ...{
        borderBottomColor: color,
        borderRightWidth: `${size / 2}px`,
        borderBottomWidth: `${size / 2}px`,
        borderLeftWidth: `${size / 2}px`,
        marginLeft: `${x}px`,
        marginTop: `${y}px`,
      },
    }}
  >
    {children}
  </div>
);

const styles = {
  root: {
    position: 'absolute',
    cursor: 'pointer',
    width: 0,
    height: 0,
    borderColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: 0,
    transform: 'translate(50%, 50%)',
  },
} as const;

export default Dot;
