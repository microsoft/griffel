import { useBarClasses } from './useBarStyles';
import { useBazClasses } from './useBazStyles';

export function ComponentA() {
  return [useBazClasses(), useBarClasses()];
}
