import { RESET } from '../../constants.js';

export function isResetValue(value: unknown) {
  return value === RESET;
}
