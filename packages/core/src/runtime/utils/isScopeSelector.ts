export function isScopeSelector(property: string): boolean {
  return property.substring(0, 6) === '@scope';
}
