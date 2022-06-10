import React from 'react';
import { DotProps } from '../types';
import { makeStyles, shorthands } from '@griffel/react';

const useStyles = makeStyles({
  root: {
    position: 'absolute',
    cursor: 'pointer',
    width: 0,
    height: 0,
    ...shorthands.borderColor('transparent'),
    ...shorthands.borderStyle('solid'),
    borderTopWidth: 0,
    transform: 'translate(50%, 50%)',
  },
});

const Dot: React.FC<DotProps> = ({ size, x, y, children, color }) => {
  const styles = useStyles();
  return (
    <div
      className={styles.root}
      style={{
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
};

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
