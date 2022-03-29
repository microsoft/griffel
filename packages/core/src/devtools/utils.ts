import { CSSClasses } from '../types';

export function getDirectionalClassName(classes: CSSClasses, direction: 'ltr' | 'rtl'): string {
  return Array.isArray(classes) ? (direction === 'rtl' ? classes[1] : classes[0]) : classes;
}
