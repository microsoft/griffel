//@ts-check
import { makeStyles } from '@griffel/core';

export default makeStyles({
  before: {
    ':before': {
      content: '""',
      position: 'absolute',
    },
  },

  after: {
    ':after': {
      color: 'red',
      content: '""',
      position: 'absolute',
    },
  },
});
