import React from 'react';
import { BoxProps } from '../types';
import View from './View';
import { mergeStyleSets } from '@uifabric/merge-styles';

const getClassNames = (colorPos: number, layout: 'row' | 'column', outer: boolean, fixed: boolean) => {
  const colors = ['#14171A', '#AAB8C2', '#E6ECF0', '#FFAD1F', '#F45D22', '#E0245E'];

  const color = colors[colorPos];
  return mergeStyleSets({
    box: {
      backgroundColor: color,
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
    },
  });
};

const Box: React.FC<BoxProps> = ({ color, fixed = false, layout = 'column', outer = false, ...other }) => {
  const styles = getClassNames(color, layout, outer, fixed);

  return <View {...other} className={styles.box} />;
};

export default Box;
