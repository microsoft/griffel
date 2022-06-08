import { makeStyles, shorthands } from '@griffel/core';

export default makeStyles({
  one: {
    ...shorthands.padding('1px'),
  },
  two: {
    ...shorthands.padding('2px', '2px'),
  },

  three: {
    ...shorthands.padding('3px', '3px'),
  },

  four: {
    ...shorthands.padding('4px', '4px', '5px'),
  },
});

export const meta = {
  name: 'Padding',
};
