import { IStyle } from '@uifabric/merge-styles';
import React from 'react';

import { BoxProps } from '../types';
import View from './View';

const COLORS = ['#14171A', '#AAB8C2', '#E6ECF0', '#FFAD1F', '#F45D22', '#E0245E'];

const Box: React.FC<BoxProps> = ({ color, fixed = false, layout = 'column', outer = false, ...other }) => {
  const styles: IStyle = {
    backgroundColor: COLORS[color],
    ...(layout === 'row' && {
      flexDirection: 'row',
    }),
    ...(outer && {
      alignSelf: 'flex-start',
      padding: '4px',
    }),
    ...(fixed && {
      width: '6px',
      height: '6px',
    }),
  };

  return <View {...other} styles={styles} />;
};

export default Box;
