import { makeStyles } from '@griffel/react';

// This should trigger @griffel/hook-naming error:
// makeStyles returns a hook, must start with "use"
const getStyles = makeStyles({
  root: { color: 'red' },
});

export { getStyles };
