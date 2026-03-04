import { makeStyles } from '@griffel/react';

export const useStyles = makeStyles({
  root: {
    animationName: 'foo',
    color: 'red',

    // LVHFA order

    ':link': {
      color: 'orange',
    },
    ':visited': {
      color: 'purple',
    },
    ':focus-within': {
      color: 'pink',
    },
    ':focus': {
      color: 'blue',
    },
    ':focus-visible': {
      color: 'salmon',
    },
    ':hover': {
      color: 'yellow',
    },
    ':active': {
      color: 'black',
    },
  },
  // at rules
  atRules: {
    animationName: {
      from: { transform: 'rotate(0deg)' },
      to: { transform: 'rotate(360deg)' },
    },
    '@supports (display: table-cell)': {
      color: 'red',
    },
    '@media (forced-colors: active)': {
      color: 'magenta',
    },
  },
});
