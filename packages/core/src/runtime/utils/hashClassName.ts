import hashString from '@emotion/hash';
import { HASH_PREFIX } from '../../constants';

interface HashedClassNameParts {
  property: string;
  value: string;
  selectors: string[];
  media: string;
  layer: string;
  support: string;
  container: string;
}

export function hashClassName({
  container,
  media,
  layer,
  property,
  selectors,
  support,
  value,
}: HashedClassNameParts): string {
  // Trimming of value is required to generate consistent hashes
  const classNameHash = hashString(selectors.join('') + container + media + layer + support + property + value.trim());

  return HASH_PREFIX + classNameHash;
}
