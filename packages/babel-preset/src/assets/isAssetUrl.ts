export function isAssetUrl(value: string): boolean {
  const url = value.replace(/^['|"]/, '');
  const isRemoteUrl =
    url.startsWith('data:') ||
    url.startsWith('http:') ||
    url.startsWith('https:') ||
    url.startsWith('//') /* Urls without protocol (use the same protocol as current page) */ ||
    url.startsWith('#');

  return !isRemoteUrl;
}
