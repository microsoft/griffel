import { makeStaticStyles } from '@griffel/react';

export const useStaticStyles = makeStaticStyles([
  {
    body: {
      background: 'red',
    },
  },
  'html { margin: 0; }',
]);
