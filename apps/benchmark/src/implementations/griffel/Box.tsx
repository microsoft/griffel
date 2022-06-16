import React from 'react';
import { BoxProps } from '../types';
import View from './View';
import { makeStyles, shorthands, mergeClasses } from '@griffel/react';

const useStyles = makeStyles({
  outer: {
    alignSelf: 'flex-start',
    ...shorthands.padding('4px'),
  },
  row: {
    flexDirection: 'row',
    '@media screen and (max-width: 1px)': {
      color: 'red',
    },
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
});

const Box: React.FC<BoxProps> = ({ color, fixed = false, layout = 'column', outer = false, ...other }) => {
  const styles = useStyles();

  return (
    <View
      {...other}
      className={mergeClasses(
        styles[`color${color}`],
        fixed && styles.fixed,
        layout === 'row' && styles.row,
        outer && styles.outer,
      )}
    />
  );
};

export default Box;
