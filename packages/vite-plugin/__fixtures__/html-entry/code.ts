import { makeStyles } from '@griffel/react';
import './app.css';

export const useStyles = makeStyles({
  root: {
    '@media (min-width: 100px)': {
      color: 'blue',
    },
    color: 'red',
  },
});

export async function loadLazyStyles() {
  const { useLazyStyles } = await import('./lazy');

  return useLazyStyles;
}

// Prevents the dynamic import above from being tree shaken
(window as unknown as Record<string, unknown>).loadLazyStyles = loadLazyStyles;
