'use client';

import { __css as vanillaCSS } from '@griffel/core';
import type { CSSClassesMapBySlot } from '@griffel/core';

import { useTextDirection } from './TextDirectionContext';

/**
 * A version of makeStyles() that accepts build output as an input and skips all runtime transforms & DOM insertion.
 *
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function __css<Slots extends string>(classesMapBySlot: CSSClassesMapBySlot<Slots>) {
  const getStyles = vanillaCSS(classesMapBySlot);

  return function useClasses(): Record<Slots, string> {
    const dir = useTextDirection();

    return getStyles({ dir });
  };
}
