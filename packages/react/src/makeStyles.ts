import { reduceToClassNameForSlots, resolveStyleRulesForSlots } from '@griffel/core';
import * as React from 'react';
import type { CSSClassesMapBySlot, CSSRulesByBucket, GriffelStyle } from '@griffel/core';

import { useRenderer } from './RendererContext';
import { useTextDirection } from './TextDirectionContext';
import { useInsertionEffect } from './useInsertionEffect';

function isInsideComponent() {
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    React.useContext({} as unknown as React.Context<unknown>);
    return true;
  } catch (e) {
    return false;
  }
}

export function makeStyles<Slots extends string | number>(stylesBySlots: Record<Slots, GriffelStyle>) {
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

  let classesMapBySlot: CSSClassesMapBySlot<Slots> | null = null;
  let cssRules: CSSRulesByBucket | null = null;

  let ltrClassNamesForSlots: Record<Slots, string> | null = null;
  let rtlClassNamesForSlots: Record<Slots, string> | null = null;

  function computeClasses(): Record<Slots, string> {
    const dir = useTextDirection();
    const renderer = useRenderer();

    const isLTR = dir === 'ltr';

    if (classesMapBySlot === null) {
      [classesMapBySlot, cssRules] = resolveStyleRulesForSlots(stylesBySlots);
    }

    if (isLTR) {
      if (ltrClassNamesForSlots === null) {
        ltrClassNamesForSlots = reduceToClassNameForSlots(classesMapBySlot, dir);
      }
    } else {
      if (rtlClassNamesForSlots === null) {
        rtlClassNamesForSlots = reduceToClassNameForSlots(classesMapBySlot, dir);
      }
    }

    useInsertionEffect(() => {
      renderer.insertCSSRules(cssRules!);
    }, [isLTR, renderer]);

    return isLTR ? (ltrClassNamesForSlots as Record<Slots, string>) : (rtlClassNamesForSlots as Record<Slots, string>);
  }

  return computeClasses;
}
