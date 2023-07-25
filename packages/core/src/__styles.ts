import { debugData, isDevToolsEnabled, getSourceURLfromError } from './devtools';
import { insertionFactory } from './insertionFactory';
import { reduceToClassNameForSlots } from './runtime/reduceToClassNameForSlots';
import type { CSSClassesMapBySlot, CSSRulesByBucket, GriffelInsertionFactory } from './types';
import type { MakeStylesOptions } from './makeStyles';

/**
 * A version of makeStyles() that accepts build output as an input and skips all runtime transforms.
 *
 * @internal
 */
export function __styles<Slots extends string>(
  classesMapBySlot: CSSClassesMapBySlot<Slots>,
  cssRules: CSSRulesByBucket,
  factory: GriffelInsertionFactory = insertionFactory,
) {
  const insertStyles = factory();

  let ltrClassNamesForSlots: Record<Slots, string> | null = null;
  let rtlClassNamesForSlots: Record<Slots, string> | null = null;

  let sourceURL: string | undefined;
  if (process.env.NODE_ENV !== 'production' && isDevToolsEnabled) {
    sourceURL = getSourceURLfromError();
  }

  function computeClasses(options: Pick<MakeStylesOptions, 'dir' | 'renderer'>): Record<Slots, string> {
    const { dir, renderer } = options;
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

    insertStyles(renderer, cssRules);

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
