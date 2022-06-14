import { resolveStyleRules } from './runtime/resolveStyleRules';
import { CSSClassesMapBySlot, CSSRulesByBucket, GriffelStyle, StyleBucketName, StylesBySlots } from './types';

/**
 * Calls resolveStyleRules() for each slot, is also used by build time transform.
 *
 * @param stylesBySlots - An object with makeStyles rules where a key is a slot name
 *
 * @return - A tuple with an object classnames mapping where a key is a slot name and an array with CSS rules
 */
export function resolveStyleRulesForSlots<Slots extends string | number>(
  stylesBySlots: StylesBySlots<Slots>,
): [CSSClassesMapBySlot<Slots>, CSSRulesByBucket] {
  const classesMapBySlot = {} as CSSClassesMapBySlot<Slots>;
  const cssRules: CSSRulesByBucket = {};

  // eslint-disable-next-line guard-for-in
  for (const slotName in stylesBySlots) {
    const slotStyles: GriffelStyle = stylesBySlots[slotName];
    const [cssClassMap, cssRulesByBucket] = resolveStyleRules(slotStyles);

    classesMapBySlot[slotName] = cssClassMap;

    (Object.keys(cssRulesByBucket) as StyleBucketName[]).forEach(styleBucketName => {
      if (styleBucketName === 'm') {
        cssRules[styleBucketName] ??= {};
        Object.keys(cssRulesByBucket[styleBucketName]!).forEach(mediaQuery => {
          cssRules[styleBucketName]![mediaQuery] ??= [];
          cssRules[styleBucketName]![mediaQuery].concat(cssRulesByBucket[styleBucketName]![mediaQuery]);
        });
      } else {
        cssRules[styleBucketName] = (cssRules[styleBucketName] || []).concat(cssRulesByBucket[styleBucketName]!);
      }
    });
  }

  return [classesMapBySlot, cssRules];
}
