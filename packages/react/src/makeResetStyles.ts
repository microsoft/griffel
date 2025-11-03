'use client';

import { makeResetStyles as vanillaMakeResetStyles } from '@griffel/core';
import type { GriffelResetStyle } from '@griffel/core';

import { insertionFactory } from './insertionFactory';
import { useRenderer } from './RendererContext';
import { useTextDirection } from './TextDirectionContext';
import { isInsideComponent } from './utils/isInsideComponent';

export function makeResetStyles(styles: GriffelResetStyle) {
  const getStyles = vanillaMakeResetStyles(styles, insertionFactory);

  if (process.env.NODE_ENV !== 'production') {
    if (isInsideComponent()) {
      throw new Error(
        [
          "makeResetStyles(): this function cannot be called in component's scope.",
          'All makeResetStyles() calls should be top level i.e. in a root scope of a file.',
        ].join(' '),
      );
    }
  }

  return function useClassName(): string {
    const dir = useTextDirection();
    const renderer = useRenderer();

    return getStyles({ dir, renderer });
  };
}
