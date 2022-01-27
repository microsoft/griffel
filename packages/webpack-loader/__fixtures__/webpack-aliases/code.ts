import { makeStyles } from '@griffel/react';
// @ts-expect-error This module will be resolved via aliases
import color from 'non-existing-color-module';

import { tokens } from './tokens';

const styles = makeStyles({
  root: {
    backgroundColor: color,
    color: tokens.colorBrandStroke1,
  },
});

console.log(styles);
