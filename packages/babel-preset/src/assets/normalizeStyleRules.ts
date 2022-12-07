import { GriffelAnimation, GriffelStyle } from '@griffel/core';
import { tokenize } from 'stylis';

import { isAssetUrl } from './isAssetUrl';

/**
 * Linaria v3 emits relative paths for assets, we normalize these paths to be relative from the project root to be the
 * same if an assets was used in different files.
 */
export function normalizeAssetPath(path: typeof import('path'), projectRoot: string, filename: string, asset: string) {
  const absoluteAssetPath = path.resolve(path.dirname(filename), asset);

  // Normalize paths to be POSIX-like to be independent of an execution environment
  return path.relative(projectRoot, absoluteAssetPath).split(path.sep).join(path.posix.sep);
}

export function normalizeStyleRule(
  path: typeof import('path'),
  projectRoot: string,
  filename: string,
  ruleValue: string | number,
) {
  if (typeof ruleValue === 'number' || ruleValue.indexOf('url(') === -1) {
    return ruleValue;
  }

  return tokenize(ruleValue).reduce((result, token, index, array) => {
    if (token === 'url') {
      const url = array[index + 1].slice(1, -1);

      if (isAssetUrl(url)) {
        array[index + 1] = `(${normalizeAssetPath(
          path,
          projectRoot,
          filename,
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
  projectRoot: string,
  filename: string,
  stylesBySlots: Record<string /* slot */, GriffelStyle> | GriffelStyle,
): Record<string /* slot */, GriffelStyle> {
  return Object.fromEntries(
    Object.entries(stylesBySlots).map(([key, value]) => {
      if (typeof value === 'undefined') {
        return [key, value];
      }

      // Fallback values or keyframes
      if (Array.isArray(value)) {
        return [
          key,
          value.map(rule => {
            if (typeof rule === 'object') {
              return normalizeStyleRules(path, projectRoot, filename, rule as GriffelAnimation);
            }

            return normalizeStyleRule(path, projectRoot, filename, rule);
          }),
        ];
      }

      // Nested objects
      if (typeof value === 'object') {
        return [key, normalizeStyleRules(path, projectRoot, filename, value as unknown as GriffelStyle)];
      }

      return [key, normalizeStyleRule(path, projectRoot, filename, value)];
    }),
  );
}
