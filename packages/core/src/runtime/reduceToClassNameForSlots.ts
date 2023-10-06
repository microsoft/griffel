import { DEFINITION_LOOKUP_TABLE } from '../constants';
import { hashSequence } from './utils/hashSequence';
import type { CSSClassesMapBySlot, CSSClassesMap, CSSClasses } from '../types';

/**
 * Reduces a classname map for slot to a classname string. Uses classnames according to text directions.
 *
 * @private
 */
export function reduceToClassName(classMap: CSSClassesMap, dir: 'ltr' | 'rtl'): [string, string] {
  let classString = '';
  let hashString = '';

  // eslint-disable-next-line guard-for-in
  for (const propertyHash in classMap) {
    const classNameMapping: CSSClasses = classMap[propertyHash];

    if (classNameMapping === null) {
      hashString += propertyHash + 'null';
      continue;
    }

    const hasRTLClassName = Array.isArray(classNameMapping);
    const className =
      dir === 'rtl'
        ? (hasRTLClassName ? classNameMapping[1] : classNameMapping) + ' '
        : (hasRTLClassName ? classNameMapping[0] : classNameMapping) + ' ';

    classString += className;
    hashString += className;
  }

  if (classString === '') {
    return ['', hashString];
  }

  return [
    classString.slice(0, -1),
    // TODO: this is strange, but keeping for the same hash gen
    hashString.slice(0, -1),
  ];
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
    const [slotClasses, hashString] = reduceToClassName(classesMapBySlot[slotName], dir);

    // Handles a case when there are no classes in a set i.e. "makeStyles({ root: {} })"
    if (hashString === '') {
      classNamesForSlots[slotName] = '';
      continue;
    }

    const sequenceHash = hashSequence(hashString, dir);
    const resultSlotClasses = sequenceHash + (slotClasses === '' ? '' : ' ' + slotClasses);

    DEFINITION_LOOKUP_TABLE[sequenceHash] = [classesMapBySlot[slotName], dir];
    classNamesForSlots[slotName] = resultSlotClasses;
  }

  return classNamesForSlots;
}
