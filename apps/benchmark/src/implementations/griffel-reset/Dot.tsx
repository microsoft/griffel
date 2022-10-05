import { makeResetStyles } from '@griffel/react';
import * as React from 'react';

import { DotProps } from '../types';

const useClasses = makeResetStyles({
  position: 'absolute',
  cursor: 'pointer',
  width: 0,
  height: 0,
  borderColor: 'transparent transparent var(--border-color)',
  borderStyle: 'solid',
  borderWidth: '0px var(--border-width) var(--border-width) var(--border-width)',
  marginLeft: 'var(--margin-left)',
  marginTop: 'var(--margin-top)',
  transform: 'translate(50%, 50%)',
});

const Dot: React.FC<DotProps> = ({ size, x, y, children, color }) => {
  return (
    <div
      className={useClasses()}
      style={
        {
          '--border-width': `${size / 2}px`,
          '--border-color': color,
          '--margin-left': `${x}px`,
          '--margin-top': `${y}px`,
        } as any
      }
    >
      {children}
    </div>
  );
};

export default Dot;
