import { makeStyles } from '@griffel/react';
import { tokens } from './tokens';
// @ts-expect-error This module will be resolved via aliases
import color from 'non-existing-color-module';

const styles = makeStyles({
  root: {
    backgroundColor: color,
    color: tokens.colorBrandStroke1,
  },
});

console.log(styles);
