import { resolveStyleRules } from './runtime/resolveStyleRules';
import { CSSClassesMapBySlot, CSSRuleData, GriffelStyle, StylesBySlots } from './types';

/**
 * Calls resolveStyleRules() for each slot, is also used by build time transform.
 *
 * @param stylesBySlots - An object with makeStyles rules where a key is a slot name
 *
 * @return - A tuple with an object classnames mapping where a key is a slot name and an array with CSS rules
 */
export function resolveStyleRulesForSlots<Slots extends string | number>(
  stylesBySlots: StylesBySlots<Slots>,
): [CSSClassesMapBySlot<Slots>, CSSRuleData[]] {
  const classesMapBySlot = {} as CSSClassesMapBySlot<Slots>;
  const cssRules: CSSRuleData[] = [];

  // eslint-disable-next-line guard-for-in
  for (const slotName in stylesBySlots) {
    const slotStyles: GriffelStyle = stylesBySlots[slotName];
    const [cssClassMap, cssRultsFoSlot] = resolveStyleRules(slotStyles);

    classesMapBySlot[slotName] = cssClassMap;
    cssRules.push(...cssRultsFoSlot);
  }

  return [classesMapBySlot, cssRules];
}
