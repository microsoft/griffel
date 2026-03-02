import { type CSSRulesByBucket, normalizeCSSBucketEntry } from '@griffel/core';

export function generateCSSRules(cssRulesByBucket: CSSRulesByBucket): string {
  const entries = Object.entries(cssRulesByBucket);

  if (entries.length === 0) {
    return '';
  }

  const cssLines: string[] = [];
  let lastEntryKey: string = '';

  for (const [cssBucketName, cssBucketEntries] of entries) {
    for (const bucketEntry of cssBucketEntries) {
      const [cssRule, metadata] = normalizeCSSBucketEntry(bucketEntry);

      const metadataAsJSON = JSON.stringify(metadata ?? null);
      const entryKey = `${cssBucketName}-${metadataAsJSON}`;

      if (lastEntryKey !== entryKey) {
        if (lastEntryKey !== '') {
          cssLines.push('/** @griffel:css-end **/');
        }

        cssLines.push(`/** @griffel:css-start [${cssBucketName}] ${metadataAsJSON} **/`);
        lastEntryKey = entryKey;
      }

      cssLines.push(cssRule);
    }
  }

  if (cssLines.length > 0) {
    cssLines.push('/** @griffel:css-end **/');
  }

  return cssLines.join('\n');
}
