import { __resetCSS as vanillaResetCSS } from '@griffel/core';
import { useTextDirection } from './TextDirectionContext';

/**
 * A version of makeResetStyles() that accepts build output as an input and skips all runtime transforms & DOM insertion.
 *
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function __resetStyles(ltrClassName: string, rtlClassName: string | null) {
  const getStyles = vanillaResetCSS(ltrClassName, rtlClassName);

  return function useClasses(): string {
    const dir = useTextDirection();

    return getStyles({ dir });
  };
}
