import type { CSSRulesByBucket } from '@griffel/core';

/**
 * Generates CSS string from CSS rules by bucket.
 * This is used to convert the CSS rules extracted during transformation into a CSS string.
 */
export function generateCSSRules(cssRulesByBucket: CSSRulesByBucket): string {
  const cssRules: string[] = [];

  // Process buckets in the standard order to ensure consistent CSS output
  const bucketOrder = ['d', 'l', 'v', 'w', 'f', 'i', 'h', 'a', 'k', 'm', 's', 't', 'r'] as const;

  for (const bucketName of bucketOrder) {
    const bucketEntries = cssRulesByBucket[bucketName];

    if (bucketEntries) {
      for (const entry of bucketEntries) {
        if (typeof entry === 'string') {
          cssRules.push(entry);
        } else if (Array.isArray(entry)) {
          // Handle [cssRule, metadata] format
          cssRules.push(entry[0]);
        }
      }
    }
  }

  return cssRules.join('');
}
