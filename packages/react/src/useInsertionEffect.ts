'use client';

// @ts-ignore — default import is intentional (avoids the webpack namespace helper that `import * as` adds); this file is `@internal` and is stripped from the published `.d.ts`.
import React from 'react';

/**
 * @internal
 */
export const useInsertionEffect: typeof React.useInsertionEffect | undefined =
  // @ts-ignore — Hack to make sure that `useInsertionEffect` will not cause bundling issues in older React versions
  // eslint-disable-next-line no-useless-concat
  React['useInsertion' + 'Effect'] ? React['useInsertion' + 'Effect'] : undefined;
