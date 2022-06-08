import { makeStyles, shorthands } from '@griffel/core';

export default makeStyles({
  root: {
    '@media(forced-colors: active)': {
      ...shorthands.borderColor('transparent'),
    },

    '@media screen and (max-width: 468px)': {
      ...shorthands.gap('1.5rem'),
      display: 'grid',
    },
  },
});

export const meta = {
  name: 'Media queries',
};
