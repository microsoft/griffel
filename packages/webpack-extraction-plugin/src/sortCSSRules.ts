import { styleBucketOrdering, normalizeCSSBucketEntry } from '@griffel/core';
import type { GriffelRenderer, StyleBucketName, CSSRulesByBucket } from '@griffel/core';

// avoid repeatedly calling `indexOf` to determine order during new insertions
const styleBucketOrderingMap = styleBucketOrdering.reduce(
  (acc, cur, j) => {
    acc[cur as StyleBucketName] = j;
    return acc;
  },
  {} as Record<StyleBucketName, number>,
);

type RuleEntry = {
  styleBucketName: StyleBucketName;
  cssRule: string;
  priority: number;
  media: string;
  container: string;
};

export function getUniqueRulesFromSets(setOfCSSRules: CSSRulesByBucket[]): RuleEntry[] {
  const uniqueCSSRules = new Map<string, RuleEntry>();

  for (const cssRulesByBucket of setOfCSSRules) {
    // eslint-disable-next-line guard-for-in
    for (const _styleBucketName in cssRulesByBucket) {
      const styleBucketName = _styleBucketName as StyleBucketName;

      for (const bucketEntry of cssRulesByBucket[styleBucketName]!) {
        const [cssRule, meta] = normalizeCSSBucketEntry(bucketEntry);

        const priority = (meta?.['p'] as number | undefined) ?? 0;
        const media = (meta?.['m'] as string | undefined) ?? '';
        const container = (meta?.['x'] as string | undefined) ?? '';

        uniqueCSSRules.set(cssRule, {
          styleBucketName: styleBucketName as StyleBucketName,
          cssRule,
          priority,
          media,
          container,
        });
      }
    }
  }

  return Array.from(uniqueCSSRules.values());
}

function compareCSSRules(
  entryA: RuleEntry,
  entryB: RuleEntry,
  compareMediaQueries: GriffelRenderer['compareMediaQueries'],
  // Container queries default to the same comparator as media queries.
  compareContainerQueries: GriffelRenderer['compareContainerQueries'] = compareMediaQueries,
): number {
  // Primary: bucket order. This keeps "@media" / "@container" rules grouped, separated from each
  // other, and always placed after regular styles before ordering within a bucket by its condition.
  // It must come first: a user-supplied comparator only understands its own condition strings and
  // can't be trusted to order empty/other-bucket values, so gating by bucket avoids scattering
  // "@container" rules throughout the output.
  const bucketDiff = styleBucketOrderingMap[entryA.styleBucketName] - styleBucketOrderingMap[entryB.styleBucketName];
  if (bucketDiff !== 0) {
    return bucketDiff;
  }

  // Within the "@media" bucket, order by media query.
  if (entryA.styleBucketName === 'm') {
    const mediaDiff = compareMediaQueries(entryA.media, entryB.media);
    if (mediaDiff !== 0) {
      return mediaDiff;
    }
  }

  // Within the "@container" bucket, order by container condition.
  if (entryA.styleBucketName === 'x') {
    const containerDiff = compareContainerQueries(entryA.container, entryB.container);
    if (containerDiff !== 0) {
      return containerDiff;
    }
  }

  return entryA.priority - entryB.priority;
}

export function sortCSSRules(
  setOfCSSRules: CSSRulesByBucket[],
  compareMediaQueries: GriffelRenderer['compareMediaQueries'],
  // Container queries default to the same comparator as media queries.
  compareContainerQueries: GriffelRenderer['compareContainerQueries'] = compareMediaQueries,
): string {
  return getUniqueRulesFromSets(setOfCSSRules)
    .sort((entryA, entryB) => compareCSSRules(entryA, entryB, compareMediaQueries, compareContainerQueries))
    .map(entry => entry.cssRule)
    .join('');
}
