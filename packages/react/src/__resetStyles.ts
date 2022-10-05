import { __resetStyles as vanillaResetStyles } from '@griffel/core';

import { useRenderer } from './RendererContext';
import { useTextDirection } from './TextDirectionContext';

/**
 * A version of makeResetStyles() that accepts build output as an input and skips all runtime transforms.
 *
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function __resetStyles(ltrClassName: string, rtlClassName: string | null, cssRules: string[]) {
  const getStyles = vanillaResetStyles(ltrClassName, rtlClassName, cssRules);

  return function useClasses(): string {
    const dir = useTextDirection();
    const renderer = useRenderer();

    return getStyles({ dir, renderer });
  };
}
