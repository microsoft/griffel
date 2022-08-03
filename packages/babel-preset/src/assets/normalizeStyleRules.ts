import { GriffelStyle } from '@griffel/core';
import * as path from 'path';
import { parseStringWithUrl } from './parseStringWithUrl';

/**
 * Linaria v3 emits relative paths for assets, we normalize these paths to be relative from the project root to be the
 * same if an assets was used in different files.
 */
export function normalizeAssetPath(projectRoot: string, filename: string, asset: string) {
  const absolutePath = path.resolve(path.dirname(filename), asset);

  // Normalize paths to be POSIX-like to be independent from an execution environment
  return path.relative(projectRoot, absolutePath).split(/[\\/]/g).join(path.posix.sep);
}

export function normalizeStyleRule(projectRoot: string, filename: string, ruleValue: string | number) {
  if (typeof ruleValue === 'number' || ruleValue.indexOf('url(') === -1) {
    return ruleValue;
  }

  const result = parseStringWithUrl(ruleValue);
  // Quotes in URL are optional, so we can also normalize them
  // https://www.w3.org/TR/CSS2/syndata.html#value-def-uri
  const url = result.url.replace(/['|"](.+)['|"]/, '$1');

  if (url.startsWith('data:')) {
    return `${result.prefix}${url}${result.suffix}`;
  }

  return `${result.prefix}${normalizeAssetPath(projectRoot, filename, url)}${result.suffix}`;
}

export function normalizeStyleRules(
  projectRoot: string,
  filename: string,
  stylesBySlots: Record<string /* slot */, GriffelStyle> | GriffelStyle,
): Record<string /* slot */, GriffelStyle> {
  return Object.fromEntries(
    Object.entries(stylesBySlots).map(([key, value]) => {
      if (typeof value === 'undefined') {
        return [key, value];
      }

      // Fallback value
      if (Array.isArray(value)) {
        return [key, value.map(rule => normalizeStyleRule(projectRoot, filename, rule as string))];
      }

      // Nested objects
      if (typeof value === 'object') {
        return [key, normalizeStyleRules(projectRoot, filename, value as unknown as GriffelStyle)];
      }

      return [key, normalizeStyleRule(projectRoot, filename, value)];
    }),
  );
}
