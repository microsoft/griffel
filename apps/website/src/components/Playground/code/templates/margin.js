import { makeStyles, shorthands } from '@griffel/core';

export default makeStyles({
  one: {
    ...shorthands.margin('1px'),
  },
  two: {
    ...shorthands.margin('2px', '2px'),
  },

  three: {
    ...shorthands.margin('3px', '3px'),
  },

  four: {
    ...shorthands.margin('4px', '4px', '5px'),
  },
});

export const meta = {
  name: 'Margin',
  position: 1,
};
