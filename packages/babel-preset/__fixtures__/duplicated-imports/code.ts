import { makeStyles as makeStylesA } from '@griffel/react';
import { makeStyles as makeStylesB } from '@griffel/react';

export const useClassesA = makeStylesA({
  root: { color: 'red' },
});

export const useClassesB = makeStylesB({
  root: { color: 'yellow' },
});
