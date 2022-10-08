import { makeResetStyles } from '@griffel/core';

export default makeResetStyles({
  color: 'blue',
  margin: 0,
  ':hover': { color: 'teal' },
});

export const meta = {
  name: 'makeResetStyles',
  position: 10,
};
