import React from 'react';
import { DotProps } from '../types';
import { makeStyles, shorthands } from '@griffel/react';

const useStyles = makeStyles({
  root: {
    position: 'absolute',
    cursor: 'pointer',
    width: 0,
    height: 0,
    ...shorthands.borderColor('transparent', 'transparent', 'var(--border-color)'),
    ...shorthands.borderStyle('solid'),
    ...shorthands.borderWidth('0px', 'var(--border-width)', 'var(--border-width)', 'var(--border-width)'),
    marginLeft: 'var(--margin-left)',
    marginTop: 'var(--margin-top)',
    transform: 'translate(50%, 50%)',
  },
});

const Dot: React.FC<DotProps> = ({ size, x, y, children, color }) => {
  const styles = useStyles();
  return (
    <div
      className={styles.root}
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
