import { makeStyles } from '@griffel/core';

export default makeStyles({
  element: {
    '& > span': {
      color: 'red',
    },
  },

  attribute: {
    '&[data-attribute]': {
      color: 'red',
    },
  },

  class: {
    '&. child-class': {
      color: 'red',
    },
  },

  childClass: {
    '&.my-class': {
      color: 'red',
    },
  },
});

export const meta = {
  name: 'Selectors',
};
