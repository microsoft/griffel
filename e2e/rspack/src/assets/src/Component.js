import { makeResetStyles, makeStyles, shorthands } from '@griffel/react';
// @ts-expect-error It's a fake module resolved via aliases
import { colors } from 'fake-colors';

const useClasses = makeStyles({
  root: {
    backgroundColor: colors.background,
    color: colors.foreground,

    ':focus': {
      outlineOffset: '5px',
    },

    '@media (min-width: 968px) and (orientation: landscape)': {
      width: '400px',
    },
  },
  slot: {
    ...shorthands.border('2px', 'dashed', 'magenta'),
    ...shorthands.borderRadius('5px'),
    ...shorthands.gap('5px'),
    ...shorthands.padding('10px'),
  },
});

const useBaseClass = makeResetStyles({
  display: 'flex',
  flexDirection: 'column',
  width: '200px',
});

export function Component() {
  return [useBaseClass(), useClasses()];
}
