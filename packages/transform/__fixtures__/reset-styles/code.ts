import { makeResetStyles } from '@griffel/react';

// griffel-csslint-disable color-named
export const useStyles = makeResetStyles({
  color: 'red',
  paddingLeft: '4px',
});

// griffel-csslint-disable color-named
// griffel-csslint-disable color-no-hex
const useOtherStyles = makeResetStyles({
  color: 'blue',
});

export { useOtherStyles };
