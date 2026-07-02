const MIN_WIDTH_REGEX = /min-width:\s*([\d.]+)/;
const MAX_WIDTH_REGEX = /max-width:\s*([\d.]+)/;

/**
 * Orders CSS query conditions — `@media` or `@container` — so that mobile-first "min-width" rules
 * cascade by ascending width automatically: a larger "min-width" is inserted later and therefore
 * wins when several conditions match the same viewport or container size.
 *
 * Pass it as the `compareMediaQueries` and/or `compareContainerQueries` option to
 * `createDOMRenderer` (runtime) or to the Griffel webpack extraction plugin (build time) when you
 * need numeric query ordering — Griffel itself defaults to a lexicographic comparator, which breaks
 * across magnitudes (e.g. "1024px" would sort before "720px").
 *
 * Semantics:
 * - "max-width" conditions come first, ordered descending (a smaller "max-width" is inserted later
 *   and wins at smaller sizes).
 * - "min-width" conditions come next, ordered ascending (a larger "min-width" is inserted later and
 *   wins at larger sizes).
 * - conditions without a parseable width, or ties (e.g. equal widths under different container
 *   names), fall back to a stable lexicographic comparison so the output stays deterministic.
 *
 * Note: the condition string may carry a container name prefix (e.g. "foo (min-width: 480px)"); the
 * width is parsed regardless of the prefix.
 *
 * @public
 */
export function compareCSSQueries(a: string, b: string): number {
  const aMin = MIN_WIDTH_REGEX.exec(a);
  const bMin = MIN_WIDTH_REGEX.exec(b);
  const aMax = MAX_WIDTH_REGEX.exec(a);
  const bMax = MAX_WIDTH_REGEX.exec(b);

  // Group order: "max-width" (0) before "min-width" (1) before conditions without a width (2).
  // A condition that contains both is treated as "min-width" (mobile-first range).
  const aGroup = aMin ? 1 : aMax ? 0 : 2;
  const bGroup = bMin ? 1 : bMax ? 0 : 2;

  if (aGroup !== bGroup) {
    return aGroup - bGroup;
  }

  // "min-width" ascending.
  if (aGroup === 1) {
    const diff = Number(aMin![1]) - Number(bMin![1]);
    if (diff !== 0) {
      return diff;
    }
  }

  // "max-width" descending.
  if (aGroup === 0) {
    const diff = Number(bMax![1]) - Number(aMax![1]);
    if (diff !== 0) {
      return diff;
    }
  }

  // Stable fallback for different container names, equal widths or non-width conditions.
  return a < b ? -1 : a > b ? 1 : 0;
}
