import { makeStyles } from '@griffel/core';

export default makeStyles({
  root: {
    '@container (max-width: 468px)': {
      display: 'grid',
      gap: '1.5rem',
    },

    '@container foo (max-width: 468px)': {
      display: 'grid',
      gap: '1.5rem',
    },
  },
});

export const meta = {
  name: 'Container queries',
  position: 11,
};
