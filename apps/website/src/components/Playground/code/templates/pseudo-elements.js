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

export const meta = {
  name: 'Pseudo-elements',
  position: 5,
};
