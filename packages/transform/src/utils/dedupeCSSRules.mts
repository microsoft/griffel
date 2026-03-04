import type { CSSRulesByBucket, CSSBucketEntry } from '@griffel/core';

/**
 * Rules that are returned by `resolveStyles()` are not deduplicated.
 * It's critical to filter out duplicates for build-time transform to avoid duplicated rules in a bundle.
 */
export function dedupeCSSRules(cssRulesByBucket: CSSRulesByBucket): CSSRulesByBucket {
  return Object.fromEntries(
    Object.entries(cssRulesByBucket).map(([styleBucketName, cssBucketEntries]) => {
      if (styleBucketName === 'm') {
        const seen = new Map<string, CSSBucketEntry>();

        for (const entry of cssBucketEntries) {
          if (!seen.has(entry[0])) {
            seen.set(entry[0], entry);
          }
        }

        return [styleBucketName, Array.from(seen.values())];
      }

      return [styleBucketName, Array.from(new Set(cssBucketEntries))];
    }),
  );
}
