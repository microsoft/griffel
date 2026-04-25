import type { GriffelStyle } from '@griffel/style-types';

import { resolveStyleRules, type ResolveStyleRulesOptions } from './runtime/resolveStyleRules.js';
import type { CSSClassesMapBySlot, CSSRulesByBucket, StyleBucketName, StylesBySlots } from './types.js';

/**
 * Calls resolveStyleRules() for each slot. Used both at runtime by makeStyles
 * and at build time by @griffel/transform.
 *
 * @param stylesBySlots - An object with makeStyles rules where a key is a slot name.
 * @param classNameHashSalt - A salt for classes hash.
 * @param options - Forwarded to resolveStyleRules (e.g. `bucketStrategy`).
 *
 * @returns A tuple with the per-slot classnames mapping and an object with CSS rules grouped by bucket.
 */
export function resolveStyleRulesForSlots<Slots extends string | number>(
  stylesBySlots: StylesBySlots<Slots>,
  classNameHashSalt: string = '',
  options: ResolveStyleRulesOptions = {},
): [CSSClassesMapBySlot<Slots>, CSSRulesByBucket] {
  const classesMapBySlot = {} as CSSClassesMapBySlot<Slots>;
  const cssRules: CSSRulesByBucket = {};

  // eslint-disable-next-line guard-for-in
  for (const slotName in stylesBySlots) {
    const slotStyles: GriffelStyle = stylesBySlots[slotName];
    const [cssClassMap, cssRulesByBucket] = resolveStyleRules(
      slotStyles,
      classNameHashSalt,
      // selectors, atRules, cssClassesMap, cssRulesByBucket, rtlValue —
      // recursion-internal accumulators. Pass undefined to use defaults.
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      options,
    );

    classesMapBySlot[slotName] = cssClassMap;

    (Object.keys(cssRulesByBucket) as StyleBucketName[]).forEach(styleBucketName => {
      cssRules[styleBucketName] = (cssRules[styleBucketName] || []).concat(cssRulesByBucket[styleBucketName]!);
    });
  }

  return [classesMapBySlot, cssRules];
}
