export function isAssetUrl(value: string): boolean {
  return !value.startsWith('data:');
}
