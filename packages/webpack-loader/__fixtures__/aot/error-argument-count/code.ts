import { makeStyles } from '@griffel/react';

// @ts-expect-error Invalid arguments for "makeStyles" function
export const useStyles = makeStyles({ root: { color: 'red' } }, 'foo');
