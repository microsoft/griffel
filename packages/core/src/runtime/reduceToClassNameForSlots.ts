import { DEFINITION_LOOKUP_TABLE, LTR_TO_RTL_LOOKUP } from '../constants';
import { hashSequence } from './utils/hashSequence';
import { CSSClassesMapBySlot, CSSClassesMap, CSSClasses } from '../types';

/**
 * Reduces a classname map for slot to a classname string. Uses classnames according to text directions.
 *
 * @private
 */
export function reduceToClassName(classMap: CSSClassesMap, dir: 'ltr' | 'rtl'): string {
  let className = '';

  // eslint-disable-next-line guard-for-in
  for (const propertyHash in classMap) {
    const classNameMapping: CSSClasses = classMap[propertyHash];

    if (classNameMapping) {
      const hasRTLClassName = Array.isArray(classNameMapping);

      if (dir === 'rtl') {
        className +=
          (hasRTLClassName
            ? classNameMapping[1]
            : // WHAT?
              //   Check the global mapping of LTR class->RTL class when given a single CSS class
              // WHY?
              //   In order to optimize bundle size and reduce duplication, the webpack extraction plugin
              //   generates a runtime module that boostraps LTR_TO_RTL_LOOKUP with the mapping of all LTR->RTL classes
              LTR_TO_RTL_LOOKUP[classNameMapping] ?? classNameMapping) + ' ';
      } else {
        className += (hasRTLClassName ? classNameMapping[0] : classNameMapping) + ' ';
      }
    }
  }

  return className.slice(0, -1);
}

/**
 * Reduces classname maps for slots to classname strings. Registers them in a definition cache to be used by
 * `mergeClasses()`.
 *
 * @internal
 */
export function reduceToClassNameForSlots<Slots extends string | number>(
  classesMapBySlot: CSSClassesMapBySlot<Slots>,
  dir: 'ltr' | 'rtl',
): Record<Slots, string> {
  const classNamesForSlots = {} as Record<Slots, string>;

  // eslint-disable-next-line guard-for-in
  for (const slotName in classesMapBySlot) {
    const slotClasses = reduceToClassName(classesMapBySlot[slotName], dir);

    // Handles a case when there are no classes in a set i.e. "makeStyles({ root: {} })"
    if (slotClasses === '') {
      classNamesForSlots[slotName] = '';
      continue;
    }

    const sequenceHash = hashSequence(slotClasses, dir);
    const resultSlotClasses = sequenceHash + ' ' + slotClasses;

    DEFINITION_LOOKUP_TABLE[sequenceHash] = [classesMapBySlot[slotName], dir];
    classNamesForSlots[slotName] = resultSlotClasses;
  }

  return classNamesForSlots;
}
