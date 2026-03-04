import * as path from 'node:path';
import { ASSET_TAG_OPEN, ASSET_TAG_CLOSE } from '@griffel/transform';
import { type CSSBucketEntry, type CSSRulesByBucket, type StyleBucketName } from '@griffel/core';

/**
 * Replaces tagged asset paths (`<griffel-asset>/abs/path</griffel-asset>`) in CSS rules
 * with paths relative to the source file. This is needed because the transform step embeds
 * absolute paths, which must be resolved relative to the source file so that css-loader can
 * resolve them correctly.
 */
function resolveAssetPathsInString(cssRule: string, sourceDir: string): string {
  let result = '';
  let searchFrom = 0;

  while (searchFrom < cssRule.length) {
    const openIdx = cssRule.indexOf(ASSET_TAG_OPEN, searchFrom);

    if (openIdx === -1) {
      result += cssRule.slice(searchFrom);
      break;
    }

    result += cssRule.slice(searchFrom, openIdx);

    const contentStart = openIdx + ASSET_TAG_OPEN.length;
    const closeIdx = cssRule.indexOf(ASSET_TAG_CLOSE, contentStart);

    if (closeIdx === -1) {
      // Malformed tag — keep the rest as-is
      result += cssRule.slice(openIdx);
      break;
    }

    const absolutePath = cssRule.slice(contentStart, closeIdx);
    const relativePath = path.relative(sourceDir, absolutePath);

    result += relativePath;
    searchFrom = closeIdx + ASSET_TAG_CLOSE.length;
  }

  return result;
}

function resolveEntry(entry: CSSBucketEntry, sourceDir: string): CSSBucketEntry {
  if (typeof entry === 'string') {
    return resolveAssetPathsInString(entry, sourceDir);
  }

  return [resolveAssetPathsInString(entry[0], sourceDir), entry[1]];
}

/**
 * Walks `CSSRulesByBucket` and replaces all tagged asset paths with paths relative to `sourceFile`.
 */
export function resolveAssetPathsInCSSRules(cssRulesByBucket: CSSRulesByBucket, sourceFile: string): CSSRulesByBucket {
  const sourceDir = path.dirname(sourceFile);
  const resolved: CSSRulesByBucket = {};

  for (const bucketName in cssRulesByBucket) {
    const entries = cssRulesByBucket[bucketName as StyleBucketName]!;
    resolved[bucketName as StyleBucketName] = entries.map(entry => resolveEntry(entry, sourceDir));
  }

  return resolved;
}
