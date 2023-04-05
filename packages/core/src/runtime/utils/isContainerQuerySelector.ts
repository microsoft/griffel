export function isContainerQuerySelector(property: string): boolean {
  return property.substring(0, 10) === '@container';
}
