import { makeStyles } from '@griffel/core';

export default makeStyles({
  focus: {
    ':focus': {
      color: 'red',
    },
  },

  hover: {
    ':hover': {
      color: 'red',
    },
  },

  active: {
    ':active': {
      color: 'red',
    },
  },
});

export const meta = {
  name: 'Pseudo-selectors',
  position: 4,
};
