import { makeStyles as vanillaMakeStyles } from '@griffel/core';
import type { GriffelStyle } from '@griffel/core';

import { insertionFactory } from './insertionFactory';
import { useRenderer } from './RendererContext';
import { useTextDirection } from './TextDirectionContext';
import { isInsideComponent } from './utils/isInsideComponent';

export function makeStyles<Slots extends string | number>(stylesBySlots: Record<Slots, GriffelStyle>) {
  const getStyles = vanillaMakeStyles(stylesBySlots, insertionFactory);

  if (process.env.NODE_ENV !== 'production') {
    if (isInsideComponent()) {
      throw new Error(
        [
          "makeStyles(): this function cannot be called in component's scope.",
          'All makeStyles() calls should be top level i.e. in a root scope of a file.',
        ].join(' '),
      );
    }
  }

  return function useClasses(): Record<Slots, string> {
    const dir = useTextDirection();
    const renderer = useRenderer();

    return getStyles({ dir, renderer });
  };
}
