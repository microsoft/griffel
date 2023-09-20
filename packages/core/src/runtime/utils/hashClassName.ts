import hashString from '@emotion/hash';
import { HASH_PREFIX } from '../../constants';

interface HashedClassNameParts {
  property: string;
  value: string;
  selector: string;
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
  selector,
  support,
  value,
}: HashedClassNameParts): string {
  const classNameHash = hashString(
    selector +
      container +
      media +
      layer +
      support +
      property +
      // Trimming of value is required to generate consistent hashes
      value.trim(),
  );

  return HASH_PREFIX + classNameHash;
}
