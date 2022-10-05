import { makeStyles, shorthands, mergeClasses } from '@griffel/react';
import React from 'react';

import { BoxProps } from '../types';
import View from './View';

const useClasses = makeStyles({
  outer: {
    alignSelf: 'flex-start',
    ...shorthands.padding('4px'),
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
});

const Box: React.FC<BoxProps> = ({ color, fixed = false, layout = 'column', outer = false, ...other }) => {
  const classes = useClasses();

  return (
    <View
      {...other}
      className={mergeClasses(
        classes[`color${color}`],
        fixed && classes.fixed,
        layout === 'row' && classes.row,
        outer && classes.outer,
      )}
    />
  );
};

export default Box;
