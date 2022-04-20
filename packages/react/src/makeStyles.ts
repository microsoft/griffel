import { makeStyles as vanillaMakeStyles } from '@griffel/core';
import * as React from 'react';
import type { GriffelStyle } from '@griffel/core';

import { useRenderer } from './RendererContext';
import { useTextDirection } from './TextDirectionContext';

function isInsideComponent() {
  // React 18 always logs errors if a dispatcher is not present:
  // https://github.com/facebook/react/blob/42f15b324f50d0fd98322c21646ac3013e30344a/packages/react/src/ReactHooks.js#L26-L36
  //
  // A check with hooks call (i.e. call "React.useContext()" outside a component) will always produce errors
  try {
    // @ts-expect-error "SECRET_INTERNALS" are not typed
    return !!React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentDispatcher.current;
  } catch (e) {
    return false;
  }
}

export function makeStyles<Slots extends string | number>(stylesBySlots: Record<Slots, GriffelStyle>) {
  const getStyles = vanillaMakeStyles(stylesBySlots);

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
