import { makeResetStyles, makeStyles } from '@griffel/react';
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
    border: '2px dashed magenta',
    borderRadius: '5px',
    gap: '5px',
    padding: '10px',
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
