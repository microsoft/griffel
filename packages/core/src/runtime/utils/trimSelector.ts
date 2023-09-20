/**
 * Trims selectors to generate consistent hashes.
 */
export function trimSelector(selector: string): string {
  return selector.replace(/>\s+/g, '>');
}
