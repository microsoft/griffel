import { type CSSRulesByBucket, normalizeCSSBucketEntry, type StyleBucketName } from '@griffel/core';

import { bucketLayerName, mediaPlaceholder, containerPlaceholder } from './layerNames.mjs';

export type GenerateCSSRulesOptions = {
  /**
   * When true, each block of rules between @griffel:css-start /
   * @griffel:css-end markers is wrapped in `@layer <name> { … }`.
   * The markers themselves stay outside the wrapper so the asset-time
   * parser still sees them at the top level.
   */
  wrapInLayer?: boolean;
};

function layerNameForEntry(
  bucket: StyleBucketName,
  metadata: Record<string, unknown> | undefined,
): string {
  const priority = metadata && typeof metadata['p'] === 'number' ? (metadata['p'] as number) : undefined;
  const media = metadata && typeof metadata['m'] === 'string' ? (metadata['m'] as string) : undefined;

  if (bucket === 'm' && media) {
    return mediaPlaceholder(media);
  }

  // Container query metadata is not currently emitted by @griffel/core; when it
  // is, callers can pass a `c` field on metadata to keep this path symmetric.
  const container =
    metadata && typeof (metadata as Record<string, unknown>)['c'] === 'string'
      ? ((metadata as Record<string, unknown>)['c'] as string)
      : undefined;
  if (bucket === 'c' && container) {
    return containerPlaceholder(container);
  }

  return bucketLayerName(bucket, priority);
}

export function generateCSSRules(
  cssRulesByBucket: CSSRulesByBucket,
  options: GenerateCSSRulesOptions = {},
): string {
  const entries = Object.entries(cssRulesByBucket);

  if (entries.length === 0) {
    return '';
  }

  const wrap = options.wrapInLayer === true;
  const cssLines: string[] = [];

  type ActiveBlock = { entryKey: string; bucket: StyleBucketName; metadata?: Record<string, unknown> };
  let active: ActiveBlock | null = null;

  function closeActive() {
    if (!active) return;
    if (wrap) {
      cssLines.push('}');
    }
    cssLines.push('/** @griffel:css-end **/');
    active = null;
  }

  for (const [cssBucketName, cssBucketEntries] of entries) {
    const bucket = cssBucketName as StyleBucketName;
    for (const bucketEntry of cssBucketEntries!) {
      const [cssRule, metadata] = normalizeCSSBucketEntry(bucketEntry);

      const metadataAsJSON = JSON.stringify(metadata ?? null);
      const entryKey = `${bucket}-${metadataAsJSON}`;

      if (!active || active.entryKey !== entryKey) {
        closeActive();
        cssLines.push(`/** @griffel:css-start [${bucket}] ${metadataAsJSON} **/`);
        if (wrap) {
          cssLines.push(`@layer ${layerNameForEntry(bucket, metadata)} {`);
        }
        active = { entryKey, bucket, metadata };
      }

      cssLines.push(cssRule);
    }
  }

  closeActive();

  return cssLines.join('\n');
}
