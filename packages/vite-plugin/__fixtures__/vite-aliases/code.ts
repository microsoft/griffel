import { makeStyles } from '@griffel/react';
// @ts-expect-error This module will be resolved via aliases
import { blueColor } from 'non-existing-color-module';

import { tokens } from './tokens';

const styles = makeStyles({
  root: {
    backgroundColor: blueColor,
    color: tokens.colorBrandStroke1,
  },
});

console.log(styles);
