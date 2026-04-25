import { makeStyles } from '@griffel/react';

// Page A's button.
//
// - Default color in bucket 'd' (catch-all).
// - Hover color in bucket 'h' (LVHA: must come AFTER bucket 'd' in the cascade).
// - Wide-screen color in bucket 'm' (@media; must come AFTER non-media buckets).
//
// All three rules use single-class selectors -> specificity is identical, so the
// cascade resolves them by source order alone.
export const usePageAStyles = makeStyles({
  button: {
    color: 'red',
    ':hover': { color: 'blue' },
    '@media (min-width: 800px)': { color: 'orange' },
  },
});
