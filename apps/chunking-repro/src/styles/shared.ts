import { makeStyles } from '@griffel/react';

// "Shared" styles imported by both pages.
//
// In default SplitChunksPlugin behavior, when a module is imported by 2+
// chunks it is hoisted into a separate chunk. So this module's atomic
// rules will end up in a different .css file from the per-page rules.
//
// Atomic rules here all live in bucket 'd' (catch-all).
export const useSharedStyles = makeStyles({
  shell: {
    display: 'block',
    padding: '12px',
    border: '1px solid black',
  },
});
