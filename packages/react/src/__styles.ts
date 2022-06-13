import { reduceToClassNameForSlots } from '@griffel/core';
import type { CSSClassesMapBySlot, CSSRulesByBucket } from '@griffel/core';

import { useRenderer } from './RendererContext';
import { useTextDirection } from './TextDirectionContext';
import { useInsertionEffect } from './useInsertionEffect';

/**
 * A version of makeStyles() that accepts build output as an input and skips all runtime transforms.
 *
 * @internal
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export function __styles<Slots extends string>(
  classesMapBySlot: CSSClassesMapBySlot<Slots>,
  cssRules: CSSRulesByBucket,
) {
  let ltrClassNamesForSlots: Record<Slots, string> | null = null;
  let rtlClassNamesForSlots: Record<Slots, string> | null = null;

  function computeClasses(): Record<Slots, string> {
    const dir = useTextDirection();
    const renderer = useRenderer();

    const isLTR = dir === 'ltr';

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
