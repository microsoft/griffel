import classnames from 'classnames';
import * as React from 'react';

import View from './View';
import './box-styles.css';

const Box: React.FC<
  React.PropsWithChildren<{
    color: number;
    layout: string;
    fixed: boolean;
    outer: boolean;
  }>
> = ({ color, fixed = false, layout = 'column', outer = false, ...other }) => (
  <View
    {...other}
    className={classnames(`color${color || 0}`, {
      fixed: fixed,
      outer: outer,
      row: layout === 'row',
    })}
  />
);

export default Box;
