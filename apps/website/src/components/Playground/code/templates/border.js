import { makeStyles, shorthands } from '@griffel/core';

export default makeStyles({
  border: {
    ...shorthands.border('1px', 'solid', 'red'),
  },
  borderTop: {
    ...shorthands.borderTop('2px', 'solid', 'blue'),
  },
  borderColor: {
    ...shorthands.borderColor('red'),
  },
  borderRadius: {
    ...shorthands.borderRadius('5px'),
  },
});

export const meta = {
  name: 'Border',
  position: 3,
};
