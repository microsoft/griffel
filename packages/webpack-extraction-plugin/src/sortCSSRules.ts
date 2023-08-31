import hash from '@emotion/hash';
import { styleBucketOrdering } from '@griffel/core';
import type { GriffelRenderer, CSSBucketEntry, CSSRulesByBucket } from '@griffel/core';

function getCSSRuleFromBucketEntry(entry: CSSBucketEntry): string {
  return Array.isArray(entry) ? entry[0] : entry;
}

function getCSSMetaFromBucketEntry(entry: CSSBucketEntry): Record<string, unknown> {
  return Array.isArray(entry) ? entry[1] : {};
}

type SortCSSRulesOptions = {
  compareMediaQueries: GriffelRenderer['compareMediaQueries'];
  enableCssChunks?: boolean;
};

export function sortCSSRules(setOfCSSRules: CSSRulesByBucket[], options: SortCSSRulesOptions) {
  const { compareMediaQueries, enableCssChunks = false } = options;
  const mediaEntries: string[] = [];

  const css = styleBucketOrdering
    .map(styleBucketName => {
      return {
        styleBucketName,
        cssBucketEntries:
          // We deduplicate CSS rules there by using them as keys in an object:
          // - create an array with pairs [key, value]
          // - use Object.fromEntries() to create an object that contains unique values
          Object.values(
            Object.fromEntries(
              setOfCSSRules.flatMap(cssRulesByBucket => {
                if (Array.isArray(cssRulesByBucket[styleBucketName])) {
                  return cssRulesByBucket[styleBucketName]!.map(bucketEntry => [
                    getCSSRuleFromBucketEntry(bucketEntry),
                    bucketEntry,
                  ]);
                }

                return [];
              }),
            ),
          ),
      };
    })
    .reduce((acc, { styleBucketName, cssBucketEntries }) => {
      if (styleBucketName === 'm') {
        if (enableCssChunks) {
          return (
            acc +
            cssBucketEntries
              .map(bucketEntry => {
                const mediaBucketMeta = getCSSMetaFromBucketEntry(bucketEntry)['m'] as string;
                mediaEntries.push(mediaBucketMeta);

                return `@layer m${hash(mediaBucketMeta)} { ${bucketEntry[0]} }`;
              })
              .join('')
          );
        }

        return (
          acc +
          cssBucketEntries
            .sort((entryA, entryB) => {
              return compareMediaQueries(
                getCSSMetaFromBucketEntry(entryA)['m'] as string,
                getCSSMetaFromBucketEntry(entryB)['m'] as string,
              );
            })
            .map(entry => entry[0])
            .join('')
        );
      }

      if (enableCssChunks && cssBucketEntries.length) {
        return acc + `@layer ${styleBucketName} { ${cssBucketEntries.join('')} }`;
      }

      return acc + cssBucketEntries.join('');
    }, '');

  return { css, mediaEntries };
}
