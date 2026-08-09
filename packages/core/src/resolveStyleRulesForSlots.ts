import type { GriffelStyle } from '@griffel/style-types';

import { GRIFFEL_VAR_PLACEHOLDER_REGEX } from './constants.js';
import { resolveStyleRules } from './runtime/resolveStyleRules.js';
import type { CSSClassesMapBySlot, CSSRulesByBucket, StyleBucketName, StylesBySlots } from './types.js';

/**
 * Calls resolveStyleRules() for each slot, is also used by build time transform.
 *
 * @param stylesBySlots - An object with makeStyles rules where a key is a slot name
 * @param classNameHashSalt - A salt for classes hash
 *
 * @return - A tuple with an object classnames mapping where a key is a slot name and an array with CSS rules
 */
export function resolveStyleRulesForSlots<Slots extends string | number>(
  stylesBySlots: StylesBySlots<Slots>,
  classNameHashSalt: string = '',
): [CSSClassesMapBySlot<Slots>, CSSRulesByBucket] {
  const classesMapBySlot = {} as CSSClassesMapBySlot<Slots>;
  const cssRules: CSSRulesByBucket = {};

  // eslint-disable-next-line guard-for-in
  for (const slotName in stylesBySlots) {
    const slotStyles: GriffelStyle = stylesBySlots[slotName];
    const [cssClassMap, cssRulesByBucket] = resolveStyleRules(slotStyles, classNameHashSalt);

    classesMapBySlot[slotName] = cssClassMap;

    (Object.keys(cssRulesByBucket) as StyleBucketName[]).forEach(styleBucketName => {
      cssRules[styleBucketName] = (cssRules[styleBucketName] || []).concat(cssRulesByBucket[styleBucketName]!);
    });
  }

  if (process.env.NODE_ENV !== 'production') {
    const leaked = detectLeakedPlaceholders(cssRules);
    if (leaked.length > 0) {
      console.error(
        [
          '@griffel/core:',
          `\n\ncreateVar(): ${leaked.length} placeholder(s) leaked into emitted CSS.`,
          '\nThis usually means a var was created with createVar() but never used as a',
          '\nkey (e.g. `[v]: "blue"`) in any makeStyles block. Vars used only in inline',
          '\nstyles will not be resolved.',
          `\n\nLeaked placeholders: ${leaked.join(', ')}`,
        ].join(''),
      );
    }
  }

  return [classesMapBySlot, cssRules];
}

function detectLeakedPlaceholders(cssRules: CSSRulesByBucket): string[] {
  const found = new Set<string>();
  for (const bucket of Object.values(cssRules)) {
    if (!bucket) continue;
    for (const entry of bucket) {
      // entries are `string | [string, Record<string, unknown>]`
      const cssText = typeof entry === 'string' ? entry : entry[0];
      const matches = cssText.match(GRIFFEL_VAR_PLACEHOLDER_REGEX);
      if (matches) {
        for (const m of matches) found.add(m);
      }
    }
  }
  return [...found];
}
