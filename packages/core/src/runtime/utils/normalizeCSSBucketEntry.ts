import { CSSBucketEntry } from '../../types';

/**
 * @internal
 *
 * @param entry - CSS bucket entry that can be either a string or an array
 * @returns An array where the first element is the CSS rule
 */
export function normalizeCSSBucketEntry(entry: CSSBucketEntry): [string] | [string, Record<string, unknown>] {
  if (!Array.isArray(entry)) {
    return [entry];
  }

  if (process.env.NODE_ENV !== 'production' && entry.length > 2) {
    throw new Error(
      'CSS Bucket contains an entry with greater than 2 items, please report this to https://github.com/microsoft/griffel/issues',
    );
  }

  return entry;
}
