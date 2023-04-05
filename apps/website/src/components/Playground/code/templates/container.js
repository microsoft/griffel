import { makeStyles, shorthands } from '@griffel/core';

export default makeStyles({
  root: {
    '@container (max-width: 468px)': {
      ...shorthands.gap('1.5rem'),
      display: 'grid',
    },

    '@container foo (max-width: 468px)': {
      ...shorthands.gap('1.5rem'),
      display: 'grid',
    },
  },
});

export const meta = {
  name: 'Container queries',
  position: 11,
};
