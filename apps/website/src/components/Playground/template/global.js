//@ts-check
import { makeStyles, shorthands } from '@griffel/core';

export default makeStyles({
  global: {
    ':global([data-global-style])': {
      ...shorthands.border('1px', 'solid'),
    },
  },
});
