import { makeStyles } from '@griffel/react';

export const styles = makeStyles({
  root: {
    color: 'red',
    animationName: { from: { opacity: 0 }, to: { opacity: 1 } },

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

    '@supports (display: table-cell)': {
      color: 'red',
    },
    '@layer color': {
      color: 'red',
    },
    '@media (forced-colors: active)': {
      color: 'magenta',
    },
  },
});
