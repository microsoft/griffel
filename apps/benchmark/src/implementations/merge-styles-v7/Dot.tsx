import { mergeStyles } from '@uifabric/merge-styles';
import React from 'react';

import { DotProps } from '../types';

const getClassName = (size: number, x: number, y: number, color: string) => {
  return mergeStyles({
    position: 'absolute',
    cursor: 'pointer',
    width: 0,
    height: 0,
    borderColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: 0,
    transform: 'translate(50%, 50%)',
    borderBottomColor: color,
    borderRightWidth: `${size / 2}px`,
    borderBottomWidth: `${size / 2}px`,
    borderLeftWidth: `${size / 2}px`,
    marginLeft: `${x}px`,
    marginTop: `${y}px`,
  });
};

const Dot: React.FC<DotProps> = ({ size, x, y, children, color }) => {
  const className = getClassName(size, x, y, color);

  return <div className={className}>{children}</div>;
};

export default Dot;
