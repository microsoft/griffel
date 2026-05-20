import { makeResetStyles, makeStyles } from '@griffel/react';
import { colors } from './colors.js';
import lightBackgroundImage from './images/background.svg';

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
  lightBackground: {
    backgroundImage: `url(${lightBackgroundImage})`,
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
