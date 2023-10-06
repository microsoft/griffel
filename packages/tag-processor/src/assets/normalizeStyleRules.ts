import type { GriffelAnimation, GriffelResetStyle, GriffelStyle } from '@griffel/core';
import { tokenize } from 'stylis';

import type { FileContext } from '../types';

/**
 * Linaria v4 emits absolute paths for assets, we normalize these paths to be relative from the project root to be the
 * same if an assets was used in different files.
 */
export function normalizeAssetPath(path: typeof import('path'), fileContext: FileContext, absoluteAssetPath: string) {
  // Normalize paths to be POSIX-like to be independent of an execution environment
  return path.relative(fileContext.root, absoluteAssetPath).split(path.sep).join(path.posix.sep);
}

export function normalizeStyleRule(path: typeof import('path'), fileContext: FileContext, ruleValue: string | number) {
  if (typeof ruleValue === 'number' || ruleValue.indexOf('url(') === -1) {
    return ruleValue;
  }

  return tokenize(ruleValue).reduce((result, token, index, array) => {
    if (token === 'url') {
      const url = array[index + 1].slice(1, -1);
      const isFilePath = url.replace(/^['|"]/, '').startsWith(fileContext.root);

      if (isFilePath) {
        array[index + 1] = `(griffel:${normalizeAssetPath(
          path,
          fileContext,
          // Quotes in URL are optional, so we can also normalize them as we know that it's a file path
          // https://www.w3.org/TR/CSS2/syndata.html#value-def-uri
          url.replace(/^['|"](.+)['|"]$/, '$1'),
        )})`;
      } else {
        // Always replace with normalized value, so @griffel/core can de-duplicate them.
        array[index + 1] = `(${url})`;
      }
    }

    return result + token;
  }, '');
}

export function normalizeStyleRules(
  path: typeof import('path'),
  fileContext: FileContext,
  stylesBySlots: Record<string /* slot */, GriffelStyle> | GriffelStyle | GriffelResetStyle,
): Record<string /* slot */, GriffelStyle> {
  return Object.fromEntries(
    Object.entries(stylesBySlots).map(([key, value]) => {
      if (typeof value === 'undefined' || value === null) {
        return [key, value];
      }

      // Fallback values or keyframes
      if (Array.isArray(value)) {
        return [
          key,
          value.map(rule => {
            if (typeof rule === 'object') {
              return normalizeStyleRules(path, fileContext, rule as GriffelAnimation);
            }

            return normalizeStyleRule(path, fileContext, rule);
          }),
        ];
      }

      // Nested objects
      if (typeof value === 'object') {
        return [key, normalizeStyleRules(path, fileContext, value as unknown as GriffelStyle)];
      }

      return [key, normalizeStyleRule(path, fileContext, value)];
    }),
  );
}
