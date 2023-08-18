import { debugData, isDevToolsEnabled } from './devtools';
import { reduceToClassNameForSlots } from './runtime/reduceToClassNameForSlots';
import type { MakeStylesOptions } from './makeStyles';
import type { CSSClassesMap, CSSClassesMapBySlot, EllidedCSSClassesMapBySlot } from './types';
import { CLASS_PROP_LOOKUP } from './constants';

/**
 * A version of makeStyles() that accepts build output as an input and skips all runtime transforms & DOM insertion.
 *
 * @internal
 */
export function __css<Slots extends string>(
  classesMapBySlot: CSSClassesMapBySlot<Slots> | EllidedCSSClassesMapBySlot<Slots>,
) {
  let ltrClassNamesForSlots: Record<Slots, string> | null = null;
  let rtlClassNamesForSlots: Record<Slots, string> | null = null;

  function computeClasses(options: Pick<MakeStylesOptions, 'dir'>): Record<Slots, string> {
    const { dir } = options;
    const isLTR = dir === 'ltr';

    if (isLTR) {
      if (ltrClassNamesForSlots === null) {
        ltrClassNamesForSlots = reducePotentiallyEllidedMapToClassNameForSlots(classesMapBySlot, dir);
      }
    } else {
      if (rtlClassNamesForSlots === null) {
        rtlClassNamesForSlots = reducePotentiallyEllidedMapToClassNameForSlots(classesMapBySlot, dir);
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

function reducePotentiallyEllidedMapToClassNameForSlots<Slots extends string | number>(
  classesMapBySlot: CSSClassesMapBySlot<Slots> | EllidedCSSClassesMapBySlot<Slots>,
  dir: 'ltr' | 'rtl',
): Record<Slots, string> {
  const normalizedClassesMapBySlot = {} as CSSClassesMapBySlot<Slots>;
  for (const slotName in classesMapBySlot) {
    const slotEntry = classesMapBySlot[slotName];
    if (Array.isArray(slotEntry)) {
      // WHAT?
      //   If a slot has an array of class strings, rather than an object mapping properties to classes, we need
      //   to reconstruct the object for `reduceToClassNameForSlots` so `mergeClasses` can still work
      // WHY?
      //   As a bundle size optimization, webpack-extraction-plugin generates a centralized map of CSS class -> property hash
      //   and specifies only a flat array of CSS classes in the makeStyle modules. This significantly reduces needless duplication.
      normalizedClassesMapBySlot[slotName] = Object.fromEntries(
        slotEntry.map(cssClass => {
          const cssProperty = CLASS_PROP_LOOKUP[cssClass] ?? '';

          if (process.env.NODE_ENV !== 'production' && !cssProperty) {
            console.error(
              `Could not find property for extracted CSS class ${cssClass}. Merging multiple classes may lead to unexpected results.`,
            );
          }

          return [cssProperty, cssClass];
        }),
      );
    } else {
      normalizedClassesMapBySlot[slotName] = slotEntry as CSSClassesMap;
    }
  }
  return reduceToClassNameForSlots(normalizedClassesMapBySlot, dir);
}
