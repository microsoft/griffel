'use client';

import { __resetStyles as vanillaResetStyles } from '@griffel/core';
import type { CSSRulesByBucket } from '@griffel/core';

import { insertionFactory } from './insertionFactory';
import { useRenderer } from './RendererContext';
import { useTextDirection } from './TextDirectionContext';

/**
 * A version of makeResetStyles() that accepts build output as an input and skips all runtime transforms.
 *
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function __resetStyles(
  ltrClassName: string,
  rtlClassName: string | null,
  cssRules: CSSRulesByBucket | string[],
) {
  const getStyles = vanillaResetStyles(ltrClassName, rtlClassName, cssRules, insertionFactory);

  return function useClasses(): string {
    const dir = useTextDirection();
    const renderer = useRenderer();

    return getStyles({ dir, renderer });
  };
}
