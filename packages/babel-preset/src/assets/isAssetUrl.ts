export function isAssetUrl(value: string): boolean {
  return (
    !value.startsWith('data:') &&
    !value.startsWith('http:') &&
    !value.startsWith('https:') &&
    !value.startsWith('//') /* Urls without protocol (use the same protocol as current page) */ &&
    !value.startsWith('#') /* Hash only urls like `filter: url(#id)` */
  );
}
