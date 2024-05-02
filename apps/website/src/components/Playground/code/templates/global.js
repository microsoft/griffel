import { makeStyles } from '@griffel/core';

export default makeStyles({
  global: {
    ':global([data-global-style])': {
      border: '1px solid',
    },
  },
});

export const meta = {
  name: 'Global styles',
  position: 9,
};
