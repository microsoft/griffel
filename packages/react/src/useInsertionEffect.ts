import * as React from 'react';

// @ts-expect-error
export const useInsertionEffect = React['useInsertion' + 'Effect']
  ? // @ts-expect-error
    React['useInsertion' + 'Effect']
  : React.useLayoutEffect;
