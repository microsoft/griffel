import { styleBucketOrdering } from '@griffel/core';
import { COMMENT, compile, serialize, stringify } from 'stylis';

import type { CSSBucketEntry, CSSRulesByBucket, StyleBucketName } from '@griffel/core';

export function parseCSSRules(css: string) {
  const cssRulesByBucket = styleBucketOrdering.reduce<CSSRulesByBucket>((acc, styleBucketName) => {
    acc[styleBucketName] = [];

    return acc;
  }, {}) as Required<CSSRulesByBucket>;
  const elements = compile(css);
  const unrelatedElements: ReturnType<typeof compile> = [];

  let cssBucketName: StyleBucketName | null = null;
  let cssMeta: Record<string, unknown> | null = null;

  for (const element of elements) {
    if (element.type === COMMENT) {
      if (element.value.indexOf('/** @griffel:css-start') === 0) {
        cssBucketName = element.value.charAt(24) as StyleBucketName;
        cssMeta = JSON.parse(element.value.slice(27, -4));

        continue;
      }

      if (element.value.indexOf('/** @griffel:css-end') === 0) {
        cssBucketName = null;
        cssMeta = null;

        continue;
      }
    }

    if (cssBucketName) {
      const cssRule = serialize([element], stringify);
      const bucketEntry: CSSBucketEntry = cssMeta ? [cssRule, cssMeta!] : cssRule;

      cssRulesByBucket[cssBucketName].push(bucketEntry);
      continue;
    }

    unrelatedElements.push(element);
  }

  return { cssRulesByBucket, remainingCSS: serialize(unrelatedElements, stringify) };
}
