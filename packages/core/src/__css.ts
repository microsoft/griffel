import { debugData, isDevToolsEnabled } from './devtools';
import { reduceToClassNameForSlots } from './runtime/reduceToClassNameForSlots';
import { MakeStylesOptions, CSSClassesMapBySlot } from './types';

/**
 * A version of makeStyles() that accepts build output as an input and skips all runtime transforms & DOM insertion.
 *
 * @internal
 */
export function __css<Slots extends string>(classesMapBySlot: CSSClassesMapBySlot<Slots>) {
  let ltrClassNamesForSlots: Record<Slots, string> | null = null;
  let rtlClassNamesForSlots: Record<Slots, string> | null = null;

  function computeClasses(options: Pick<MakeStylesOptions, 'dir'>): Record<Slots, string> {
    const { dir } = options;
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

    const classNamesForSlots = isLTR
      ? (ltrClassNamesForSlots as Record<Slots, string>)
      : (rtlClassNamesForSlots as Record<Slots, string>);

    if (process.env.NODE_ENV !== 'production' && isDevToolsEnabled) {
      debugData.addSequenceDetails(classNamesForSlots!);
    }

    return classNamesForSlots;
  }

  return computeClasses;
}
