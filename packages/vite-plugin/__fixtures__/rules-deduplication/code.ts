import { makeStyles } from '@griffel/react';
import { useStylesB } from './styles';

export const useStylesA = makeStyles({
  root: {
    color: 'red',
  },
});

export { useStylesB };
