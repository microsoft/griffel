import * as React from 'react';

export const useInsertionEffect: typeof React.useInsertionEffect | undefined =
  // @ts-expect-error Hack to make sure that `useInsertionEffect` will not cause bundling issues in older React versions
  // eslint-disable-next-line no-useless-concat
  React['useInsertion' + 'Effect'] ? React['useInsertion' + 'Effect'] : undefined;
