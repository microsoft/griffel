import hashString from '@emotion/hash';
import { HASH_PREFIX } from '../../constants';

export interface HashedClassNameParts {
  property: string;
  value: string;
  selectors: string[];
  media: string;
  layer: string;
  support: string;
}

export function hashClassName({ media, layer, property, selectors, support, value }: HashedClassNameParts): string {
  // Trimming of value is required to generate consistent hashes
  const classNameHash = hashString(selectors.join('') + media + layer + support + property + value.trim());

  return HASH_PREFIX + classNameHash;
}
