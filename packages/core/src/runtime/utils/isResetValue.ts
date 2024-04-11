import { RESET } from '../../constants';

export function isResetValue(value: unknown) {
  return value === RESET;
}
