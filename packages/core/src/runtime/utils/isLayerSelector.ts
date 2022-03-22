export function isLayerSelector(property: string): boolean {
  return property.substr(0, 6) === '@layer';
}
