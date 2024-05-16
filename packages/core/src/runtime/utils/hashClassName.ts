import hashString from '@emotion/hash';

import { HASH_PREFIX } from '../../constants';
import type { AtRules } from './types';

interface HashedClassNameParts {
  property: string;
  value: string;
  selector: string;
}

export function hashClassName({ property, selector, value }: HashedClassNameParts, atRules: AtRules): string {
  return (
    HASH_PREFIX +
    hashString(
      selector +
        atRules.container +
        atRules.media +
        atRules.layer +
        atRules.supports +
        property +
        // Trimming of value is required to generate consistent hashes
        value.trim(),
    )
  );
}
