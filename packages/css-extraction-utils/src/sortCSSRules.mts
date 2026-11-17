import {
  styleBucketOrdering,
  normalizeCSSBucketEntry,
  resolveCascadeLayer,
  type GriffelCascadeLayerFn,
  type GriffelRenderer,
  type StyleBucketName,
  type CSSRulesByBucket,
} from '@griffel/core';

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

function isLayeredCSSRule(cssRule: string): boolean {
  return cssRule.slice(0, 7) === '@layer ';
}

/**
 * Serializes sorted rules into cascade layers: consecutive rules that share a layer are wrapped into a single
 * `@layer <name>{...}` block. Sorting is still required: it defines the order of rules inside a layer (priorities,
 * media & container queries) and keeps the output identical to what the runtime inserts.
 */
function serializeInCascadeLayers(entries: RuleEntry[], cascadeLayer: GriffelCascadeLayerFn): string {
  // 👇 a layer is a property of a style sheet (bucket + media/container query + priority), resolve it once per sheet
  const layerCache = new Map<string, string | undefined>();

  let result = '';
  let currentLayer: string | undefined;
  let currentLayerCSS = '';

  const flush = () => {
    if (currentLayer !== undefined && currentLayerCSS.length > 0) {
      result += '@layer ' + currentLayer + '{' + currentLayerCSS + '}';
    }

    currentLayer = undefined;
    currentLayerCSS = '';
  };

  for (const entry of entries) {
    const sheetKey = entry.styleBucketName + '|' + entry.priority + '|' + entry.media + '|' + entry.container;

    if (!layerCache.has(sheetKey)) {
      layerCache.set(
        sheetKey,
        resolveCascadeLayer(cascadeLayer, entry.styleBucketName, {
          p: entry.priority,
          m: entry.media || undefined,
          x: entry.container || undefined,
        }),
      );
    }

    const layer = layerCache.get(sheetKey);

    // 👇 unlayered rules & rules that already name a layer are emitted as is
    if (layer === undefined || isLayeredCSSRule(entry.cssRule)) {
      flush();
      result += entry.cssRule;
      continue;
    }

    if (layer !== currentLayer) {
      flush();
      currentLayer = layer;
    }

    currentLayerCSS += entry.cssRule;
  }

  flush();

  return result;
}

export function sortCSSRules(
  setOfCSSRules: CSSRulesByBucket[],
  compareMediaQueries: GriffelRenderer['compareMediaQueries'],
  // Container queries default to the same comparator as media queries.
  compareContainerQueries: GriffelRenderer['compareContainerQueries'] = compareMediaQueries,
  cascadeLayer?: GriffelCascadeLayerFn,
): string {
  const entries = getUniqueRulesFromSets(setOfCSSRules).sort((entryA, entryB) =>
    compareCSSRules(entryA, entryB, compareMediaQueries, compareContainerQueries),
  );

  if (cascadeLayer) {
    return serializeInCascadeLayers(entries, cascadeLayer);
  }

  let result = '';

  for (let i = 0; i < entries.length; i++) {
    result += entries[i].cssRule;
  }

  return result;
}
