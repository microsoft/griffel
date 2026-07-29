'use client';

// griffel-css-extraction-disable

import { makeStyles as vanillaMakeStyles, type GriffelInsertionFactory, type GriffelStyle } from '@griffel/core';

// A wrapper cannot be extracted ahead of time: the styles are only known at runtime. Without the
// marker on top of the file this throws instead of being left as is.
export function makeStyles<Slots extends string>(
  stylesBySlots: Record<Slots, GriffelStyle>,
  insertionFactory: GriffelInsertionFactory,
) {
  return vanillaMakeStyles(stylesBySlots, insertionFactory);
}
