import { CSSBucketEntry } from '../../types';

export function normalizeCSSBucketEntry(entry: CSSBucketEntry): [string] | [string, Record<string, unknown>] {
  if (!Array.isArray(entry)) {
    return [entry];
  }

  return entry;
}
