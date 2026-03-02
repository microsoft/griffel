'use client';

import { __staticCSS as vanillaStaticCSS } from '@griffel/core';

/**
 * A version of makeStaticStyles() that accepts build output as an input and skips all runtime transforms & DOM insertion.
 *
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function __staticCSS() {
  const getStyles = vanillaStaticCSS();

  return function useStaticStyles(): void {
    return getStyles();
  };
}
