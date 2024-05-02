import { makeStyles, shorthands } from '@griffel/core';

export default makeStyles({
  border: {
    border: '1px solid red',
  },
  borderTop: {
    borderTop: '2px solid blue',
  },
  borderColor: {
    ...shorthands.borderColor('red'),
  },
  borderRadius: {
    borderRadius: '5px',
  },
});

export const meta = {
  name: 'Border',
  position: 3,
};
