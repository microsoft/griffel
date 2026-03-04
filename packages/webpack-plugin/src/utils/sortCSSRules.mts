import {
  styleBucketOrdering,
  normalizeCSSBucketEntry,
  type GriffelRenderer,
  type StyleBucketName,
  type CSSRulesByBucket,
} from '@griffel/core';

// avoid repeatedly calling `indexOf` to determine order during new insertions
const styleBucketOrderingMap = styleBucketOrdering.reduce((acc, cur, j) => {
  acc[cur as StyleBucketName] = j;
  return acc;
}, {} as Record<StyleBucketName, number>);

type RuleEntry = { styleBucketName: StyleBucketName; cssRule: string; priority: number; media: string };

export function getUniqueRulesFromSets(setOfCSSRules: CSSRulesByBucket[]): RuleEntry[] {
  const uniqueCSSRules = new Map<string, RuleEntry>();

  for (const cssRulesByBucket of setOfCSSRules) {
    for (const _styleBucketName in cssRulesByBucket) {
      const styleBucketName = _styleBucketName as StyleBucketName;

      for (const bucketEntry of cssRulesByBucket[styleBucketName]!) {
        const [cssRule, meta] = normalizeCSSBucketEntry(bucketEntry);

        const priority = (meta?.['p'] as number | undefined) ?? 0;
        const media = (meta?.['m'] as string | undefined) ?? '';

        uniqueCSSRules.set(cssRule, { styleBucketName: styleBucketName as StyleBucketName, cssRule, priority, media });
      }
    }
  }

  return Array.from(uniqueCSSRules.values());
}

function compareCSSRules(
  a: RuleEntry,
  b: RuleEntry,
  compareMediaQueries: GriffelRenderer['compareMediaQueries'],
): number {
  return (
    compareMediaQueries(a.media, b.media) ||
    styleBucketOrderingMap[a.styleBucketName] - styleBucketOrderingMap[b.styleBucketName] ||
    a.priority - b.priority
  );
}

export function sortCSSRules(
  setOfCSSRules: CSSRulesByBucket[],
  compareMediaQueries: GriffelRenderer['compareMediaQueries'],
): string {
  const entries = getUniqueRulesFromSets(setOfCSSRules).sort((a, b) => compareCSSRules(a, b, compareMediaQueries));

  let result = '';

  for (let i = 0; i < entries.length; i++) {
    result += entries[i].cssRule;
  }

  return result;
}
