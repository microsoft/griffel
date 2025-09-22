import type { CSSRulesByBucket } from '@griffel/core';

/**
 * Rules that are returned by `resolveStyles()` are not deduplicated.
 * It's critical to filter out duplicates for build-time transform to avoid duplicated rules in a bundle.
 */
export function dedupeCSSRules(cssRulesByBucket: CSSRulesByBucket): CSSRulesByBucket {
  return Object.fromEntries(
    Object.entries(cssRulesByBucket).map(([styleBucketName, cssBucketEntries]) => {
      if (styleBucketName === 'm') {
        return [
          styleBucketName,
          cssBucketEntries.filter(
            (entryA, index, entries) => entries.findIndex(entryB => entryA[0] === entryB[0]) === index,
          ),
        ];
      }

      return [styleBucketName, [...new Set(cssBucketEntries)]];
    }),
  );
}
