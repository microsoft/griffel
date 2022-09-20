import { makeStyles } from '@griffel/core';

export default makeStyles({
  element: {
    '& > span': {
      color: 'red',
    },
  },

  attribute: {
    '&[data-attribute]': {
      color: 'magenta',
    },
  },

  class: {
    '&.my-class': {
      color: 'olive',
    },
  },

  childClass: {
    '& .my-class': {
      color: 'pink',
    },
  },
});

export const meta = {
  name: 'Selectors',
  position: 6,
};
