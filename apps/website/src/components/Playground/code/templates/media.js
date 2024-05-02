import { makeStyles } from '@griffel/core';

export default makeStyles({
  root: {
    '@media(forced-colors: active)': {
      border: '1px solid transparent',
    },

    '@media screen and (max-width: 468px)': {
      display: 'grid',
      gap: '1.5rem',
    },
  },
});

export const meta = {
  name: 'Media queries',
  position: 8,
};
