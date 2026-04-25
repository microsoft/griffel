import { makeStyles } from '@griffel/react';

// Page B's button. Different default color than Page A, but the SAME
// hover and SAME @media wide-screen color.
//
// Page B also uses the `gap` shorthand (priority -1) plus a `rowGap`
// longhand (priority 0). The plugin sorts by priority within bucket 'd'
// so that the shorthand emits BEFORE the longhand, ensuring the longhand
// "wins" in the cascade. If the plugin emits two separate chunks
// instead, that priority is enforced only by source order across files,
// which is unstable.
export const usePageBStyles = makeStyles({
  button: {
    color: 'green',
    display: 'inline-flex',
    gap: '8px',
    rowGap: '24px',
    ':hover': { color: 'blue' },
    '@media (min-width: 800px)': { color: 'orange' },
  },
});
