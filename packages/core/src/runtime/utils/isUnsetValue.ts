import { UNSET } from '../../constants';

export function isUnsetValue(value: unknown) {
  return value === UNSET;
}
