import { isDevToolsEnabled } from './devtools/isDevToolsEnabled';
import { MK_DEBUG } from './devtools/store';
import { resolveStyleRulesForSlots } from './resolveStyleRulesForSlots';
import { reduceToClassNameForSlots } from './runtime/reduceToClassNameForSlots';
import { CSSClassesMapBySlot, CSSRulesByBucket, MakeStylesOptions, SequenceHash, StylesBySlots } from './types';

export function makeStyles<Slots extends string | number>(stylesBySlots: StylesBySlots<Slots>) {
  const insertionCache: Record<string, boolean> = {};

  let classesMapBySlot: CSSClassesMapBySlot<Slots> | null = null;
  let cssRules: CSSRulesByBucket | null = null;

  let ltrClassNamesForSlots: Record<Slots, string> | null = null;
  let rtlClassNamesForSlots: Record<Slots, string> | null = null;

  function computeClasses(options: MakeStylesOptions): Record<Slots, string> {
    const { dir, renderer } = options;

    if (classesMapBySlot === null) {
      [classesMapBySlot, cssRules] = resolveStyleRulesForSlots(stylesBySlots);
    }

    const isLTR = dir === 'ltr';
    // As RTL classes are different they should have a different cache key for insertion
    const rendererId = isLTR ? renderer.id : renderer.id + 'r';

    if (isLTR) {
      if (ltrClassNamesForSlots === null) {
        ltrClassNamesForSlots = reduceToClassNameForSlots(classesMapBySlot, dir);

        process.env.NODE_ENV !== 'production' &&
          isDevToolsEnabled &&
          Object.entries(ltrClassNamesForSlots!).forEach(([slotName, sequenceHash]) => {
            MK_DEBUG.addSequenceDetails(sequenceHash as SequenceHash, slotName);
          });
      }
    } else {
      if (rtlClassNamesForSlots === null) {
        rtlClassNamesForSlots = reduceToClassNameForSlots(classesMapBySlot, dir);

        process.env.NODE_ENV !== 'production' &&
          isDevToolsEnabled &&
          Object.entries(rtlClassNamesForSlots!).forEach(([slotName, sequenceHash]) => {
            MK_DEBUG.addSequenceDetails(sequenceHash as SequenceHash, slotName);
          });
      }
    }

    if (insertionCache[rendererId] === undefined) {
      renderer.insertCSSRules(cssRules!);
      insertionCache[rendererId] = true;
    }

    return isLTR ? (ltrClassNamesForSlots as Record<Slots, string>) : (rtlClassNamesForSlots as Record<Slots, string>);
  }

  return computeClasses;
}
