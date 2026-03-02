'use client';

import { __staticStyles as vanillaStaticStyles } from '@griffel/core';
import type { CSSRulesByBucket } from '@griffel/core';

import { insertionFactory } from './insertionFactory';
import { useRenderer } from './RendererContext';

/**
 * A version of makeStaticStyles() that accepts build output as an input and skips all runtime transforms.
 *
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function __staticStyles(cssRules: CSSRulesByBucket) {
  const getStyles = vanillaStaticStyles(cssRules, insertionFactory);

  return function useStaticStyles(): void {
    const renderer = useRenderer();

    return getStyles({ renderer });
  };
}
