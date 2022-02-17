import { makeStyles } from '@griffel/core';

export default makeStyles({
  root: {
    backgroundColor: 'red',
    paddingLeft: '10px',
    '@media(forced-colors: active):': {
      borderColor: 'transparent',
    },
  },
});
