interface ParsedCondition {
  /** Optional `@container` name prefix, or `''` when absent. Used only as a tiebreak. */
  containerName: string;
  /**
   * Bucket order (primary sort key):
   * `0` upper-bound-only (`max`, desktop-first) → `1` lower-bound-only (`min`, mobile-first) →
   * `2` bounded range (`min` + `max`) → `3` non-size (anything without a `min`/`max` feature).
   */
  bucket: number;
  /** `0` when the primary axis is `width`, `1` when it is `height`. */
  primaryAxis: number;
  /** Governing lower bound (largest `min`) on the primary axis, or `0`. */
  lowerValue: number;
  /** Governing upper bound (smallest `max`) on the primary axis, or `0`. */
  upperValue: number;
}

// A leading identifier followed by whitespace and a "(" is treated as the container name,
// e.g. "slot-container (min-width: 720px)".
const CONTAINER_NAME_REGEX = /^\s*([-\w]+)\s+\(/;
// Classic feature form, e.g. "min-width: 720px", "max-height: 1023px". Values in px, rem/em or
// unitless (covers unitless 0). A single condition may contain more than one (an `and` band).
const FEATURE_REGEX = /(min|max)-(width|height)\s*:\s*([\d.]+)(px|rem|em)?/gi;

/** Root font size (px) used to convert `rem`/`em` lengths when no override is provided. */
const DEFAULT_ROOT_FONT_SIZE = 16;

/** Options for {@link createCompareCSSQueries}. */
export interface CompareCSSQueriesOptions {
  /**
   * Root font size in pixels used to convert `rem`/`em` lengths to a comparable magnitude. Set this
   * to match your app's root font size (e.g. `10` when using `font-size: 62.5%`). Defaults to `16`.
   */
  rootFontSize?: number;
}

/**
 * Converts a CSS length to pixels. Supports `px` and unitless (covers unitless `0`); `rem`/`em`
 * are converted against `rootFontSize`.
 */
function toPx(value: string, unit: string | undefined, rootFontSize: number): number {
  const n = Number(value);

  if (unit === 'rem' || unit === 'em') {
    return n * rootFontSize;
  }

  return n;
}

/**
 * Parses a CSS at-rule condition string into a normalized, order-relevant summary. Only `min-`/`max-`
 * width/height features are read numerically; anything else yields no bounds and lands in the
 * non-size bucket, where it is ordered lexicographically. Never throws.
 */
function parse(input: string, rootFontSize: number): ParsedCondition {
  const nameMatch = CONTAINER_NAME_REGEX.exec(input);
  const containerName = nameMatch ? nameMatch[1] : '';

  let hasWidth = false;
  let lowerWidth = -Infinity; // largest min-width
  let upperWidth = Infinity; // smallest max-width
  let hasLowerWidth = false;
  let hasUpperWidth = false;

  let hasHeight = false;
  let lowerHeight = -Infinity; // largest min-height
  let upperHeight = Infinity; // smallest max-height
  let hasLowerHeight = false;
  let hasUpperHeight = false;

  for (const match of input.matchAll(FEATURE_REGEX)) {
    const value = toPx(match[3], match[4]?.toLowerCase(), rootFontSize);
    if (!Number.isFinite(value)) {
      continue;
    }

    const isMin = match[1].toLowerCase() === 'min';

    if (match[2].toLowerCase() === 'width') {
      hasWidth = true;
      if (isMin) {
        hasLowerWidth = true;
        lowerWidth = Math.max(lowerWidth, value);
      } else {
        hasUpperWidth = true;
        upperWidth = Math.min(upperWidth, value);
      }
    } else {
      hasHeight = true;
      if (isMin) {
        hasLowerHeight = true;
        lowerHeight = Math.max(lowerHeight, value);
      } else {
        hasUpperHeight = true;
        upperHeight = Math.min(upperHeight, value);
      }
    }
  }

  // Width is preferred as the primary axis whenever the condition mentions it.
  const primaryIsWidth = hasWidth;
  const hasLower = primaryIsWidth ? hasLowerWidth : hasLowerHeight;
  const hasUpper = primaryIsWidth ? hasUpperWidth : hasUpperHeight;

  let bucket: number;
  if (!hasWidth && !hasHeight) {
    bucket = 3;
  } else if (hasLower && hasUpper) {
    bucket = 2;
  } else if (hasUpper) {
    bucket = 0;
  } else {
    bucket = 1;
  }

  return {
    containerName,
    bucket,
    primaryAxis: primaryIsWidth ? 0 : 1,
    lowerValue: hasLower ? (primaryIsWidth ? lowerWidth : lowerHeight) : 0,
    upperValue: hasUpper ? (primaryIsWidth ? upperWidth : upperHeight) : 0,
  };
}

/**
 * Creates a comparator that orders CSS query conditions — `@media` or `@container` — so that
 * responsive rules cascade in the correct order regardless of magnitude: mobile-first `min` rules
 * ascend (a larger minimum is inserted later and wins at larger sizes) and desktop-first `max` rules
 * descend (a smaller maximum is inserted later and wins at smaller sizes).
 *
 * Use this factory when you need to configure how `rem`/`em` lengths are converted — pass
 * `rootFontSize` to match your app's root font size (e.g. `10` when using `font-size: 62.5%`). For
 * the default 16px root, the ready-made {@link compareCSSQueries} export can be used directly.
 *
 * Pass the returned comparator as the `compareMediaQueries` and/or `compareContainerQueries` option
 * to `createDOMRenderer` (runtime) or to the Griffel webpack extraction plugin (build time). Griffel
 * itself defaults to a lexicographic comparator, which breaks across magnitudes (e.g. "1024px" would
 * sort before "720px"). Because ordering is derived purely from the string it is identical at build
 * time and runtime.
 *
 * The comparator reads `min-width` / `max-width` and `min-height` / `max-height` features (also when
 * combined with `and`, e.g. `(max-width: 730px) and (min-width: 513px)`, or carrying a `@container`
 * name prefix). Lengths may be `px`, unitless `0`, or `rem`/`em` (converted against `rootFontSize`).
 * Any condition without such a feature (e.g. `style()` queries or range-operator syntax) is treated
 * as non-ordered and falls back to a stable lexicographic comparison. The comparator never throws.
 *
 * Ordering semantics (a **total order** — stable, transitive, antisymmetric):
 *
 * 1. Bucket: upper-bound-only (`max`, desktop-first) → lower-bound-only (`min`, mobile-first) →
 *    bounded range (`min` + `max`) → non-size.
 * 2. Within a bucket, group by axis (width before height, keyed on the condition's primary axis —
 *    width if present, otherwise height).
 * 3. Numeric compare on the governing bound: lower-bound family ascending, upper-bound family
 *    descending. Bounded ranges are governed by their lower bound ascending, with the upper bound
 *    as a numeric tiebreak.
 * 4. Tiebreaks: container name lexicographic, then the full original string lexicographic. Equal
 *    strings return `0`.
 *
 * This is 100% backward compatible with the previous `min-width`/`max-width`-only comparator: pure
 * width inputs keep the same relative order.
 *
 * @public
 */
export function createCompareCSSQueries(options: CompareCSSQueriesOptions = {}): (a: string, b: string) => number {
  const rootFontSize = options.rootFontSize ?? DEFAULT_ROOT_FONT_SIZE;

  return function compareCSSQueries(a: string, b: string): number {
    if (a === b) {
      return 0;
    }

    const pa = parse(a, rootFontSize);
    const pb = parse(b, rootFontSize);

    // 1. Bucket order.
    if (pa.bucket !== pb.bucket) {
      return pa.bucket - pb.bucket;
    }

    // Non-size conditions carry no length to compare — order them lexicographically and stop.
    if (pa.bucket === 3) {
      return a < b ? -1 : 1;
    }

    // 2. Axis group (width before height).
    if (pa.primaryAxis !== pb.primaryAxis) {
      return pa.primaryAxis - pb.primaryAxis;
    }

    // 3. Numeric compare on the governing bound.
    if (pa.bucket === 0) {
      // Upper-bound-only: descending (a smaller max is inserted later and wins at smaller sizes).
      if (pa.upperValue !== pb.upperValue) {
        return pb.upperValue - pa.upperValue;
      }
    } else if (pa.bucket === 1) {
      // Lower-bound-only: ascending (a larger min is inserted later and wins at larger sizes).
      if (pa.lowerValue !== pb.lowerValue) {
        return pa.lowerValue - pb.lowerValue;
      }
    } else {
      // Bounded range: governed by the lower bound ascending, then the upper bound ascending.
      if (pa.lowerValue !== pb.lowerValue) {
        return pa.lowerValue - pb.lowerValue;
      }
      if (pa.upperValue !== pb.upperValue) {
        return pa.upperValue - pb.upperValue;
      }
    }

    // 4. Tiebreaks: container name, then the full original string (guarantees a total order).
    if (pa.containerName !== pb.containerName) {
      return pa.containerName < pb.containerName ? -1 : 1;
    }

    return a < b ? -1 : 1;
  };
}

/**
 * Orders CSS query conditions — `@media` or `@container` — numerically, using a 16px root for
 * `rem`/`em` conversion. This is the ready-made comparator for the common case; when you need a
 * different root font size (e.g. `10` for `font-size: 62.5%`), use {@link createCompareCSSQueries}.
 *
 * Pass it as the `compareMediaQueries` and/or `compareContainerQueries` option to
 * `createDOMRenderer` (runtime) or to the Griffel webpack extraction plugin (build time). See
 * {@link createCompareCSSQueries} for the full ordering semantics.
 *
 * @public
 */
export const compareCSSQueries: (a: string, b: string) => number = createCompareCSSQueries();
