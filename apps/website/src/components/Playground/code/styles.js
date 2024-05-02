import { makeStyles } from '@griffel/core';

export default makeStyles({
  root: {
    backgroundColor: 'red',
    paddingLeft: '10px',
    '@media(forced-colors: active)': {
      border: '1px solid transparent',
    },
  },
});
