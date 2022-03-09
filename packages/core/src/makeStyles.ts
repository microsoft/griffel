import { debugData, isDevToolsEnabled, getSourceURLfromError } from './devtools';
import { resolveStyleRulesForSlots } from './resolveStyleRulesForSlots';
import { reduceToClassNameForSlots } from './runtime/reduceToClassNameForSlots';
import type { CSSClassesMapBySlot, CSSRulesByBucket, GriffelRenderer, StylesBySlots } from './types';

export interface MakeStylesOptions {
  dir: 'ltr' | 'rtl';
  renderer: GriffelRenderer;
}

export function makeStyles<Slots extends string | number>(stylesBySlots: StylesBySlots<Slots>) {
  const insertionCache: Record<string, boolean> = {};

  let classesMapBySlot: CSSClassesMapBySlot<Slots> | null = null;
  let cssRules: CSSRulesByBucket | null = null;

  let ltrClassNamesForSlots: Record<Slots, string> | null = null;
  let rtlClassNamesForSlots: Record<Slots, string> | null = null;

  let sourceURL: string | undefined;
  if (process.env.NODE_ENV !== 'production' && isDevToolsEnabled) {
    sourceURL = getSourceURLfromError();
  }

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
      }
    } else {
      if (rtlClassNamesForSlots === null) {
        rtlClassNamesForSlots = reduceToClassNameForSlots(classesMapBySlot, dir);
      }
    }

    if (insertionCache[rendererId] === undefined) {
      renderer.insertCSSRules(cssRules!);
      insertionCache[rendererId] = true;
    }
    const classNamesForSlots = isLTR
      ? (ltrClassNamesForSlots as Record<Slots, string>)
      : (rtlClassNamesForSlots as Record<Slots, string>);

    if (process.env.NODE_ENV !== 'production' && isDevToolsEnabled) {
      debugData.addSequenceDetails(classNamesForSlots!, sourceURL);
    }

    return classNamesForSlots;
  }

  return computeClasses;
}
