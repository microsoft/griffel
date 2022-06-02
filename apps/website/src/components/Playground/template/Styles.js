//@ts-check
import { makeStyles, shorthands } from '@griffel/core';

export default makeStyles({
  root: {
    backgroundColor: 'red',
    paddingLeft: '10px',
    '@media(forced-colors: active)': {
      ...shorthands.borderColor('transparent'),
    },
  },
});
