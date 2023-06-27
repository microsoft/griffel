import { useBarClasses } from './useBarStyles';
import { useQuxClasses } from './useQuxStyles';

export function ComponentB() {
  return [useQuxClasses(), useBarClasses()];
}
