interface ParsedCondition {
  containerName: string;
  bucket: number;
  primaryAxis: number;
  lowerValue: number;
  upperValue: number;
}

const CONTAINER_NAME_REGEX = /^\s*([-\w]+)\s+\(/;
const FEATURE_REGEX = /(min|max)-(width|height)\s*:\s*([\d.]+)(px|rem|em)?/gi;

const DEFAULT_ROOT_FONT_SIZE = 16;

export interface CompareCSSQueriesOptions {
  /** Root font size in px used to convert `rem`/`em` lengths. Defaults to `16`. */
  rootFontSize?: number;
}

function toPx(value: string, unit: string | undefined, rootFontSize: number): number {
  const n = Number(value);

  if (unit === 'rem' || unit === 'em') {
    return n * rootFontSize;
  }

  return n;
}

function parse(input: string, rootFontSize: number): ParsedCondition {
  const nameMatch = CONTAINER_NAME_REGEX.exec(input);
  const containerName = nameMatch ? nameMatch[1] : '';

  let hasWidth = false;
  let lowerWidth = -Infinity;
  let upperWidth = Infinity;
  let hasLowerWidth = false;
  let hasUpperWidth = false;

  let hasHeight = false;
  let lowerHeight = -Infinity;
  let upperHeight = Infinity;
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
 * Creates a comparator that orders `@media`/`@container` conditions numerically so responsive rules
 * cascade correctly regardless of magnitude: `min` rules ascend, `max` rules descend. Reads
 * `min`/`max` width/height features (`px`, unitless, or `rem`/`em` via `rootFontSize`); conditions
 * without such a feature fall back to a stable lexicographic order. Never throws.
 *
 * Pass the result as `compareMediaQueries`/`compareContainerQueries` to `createDOMRenderer` or the
 * Griffel webpack extraction plugin. Use `rootFontSize` to match a non-default root (e.g. `10`).
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

    if (pa.bucket !== pb.bucket) {
      return pa.bucket - pb.bucket;
    }

    if (pa.bucket === 3) {
      return a < b ? -1 : 1;
    }

    if (pa.primaryAxis !== pb.primaryAxis) {
      return pa.primaryAxis - pb.primaryAxis;
    }

    if (pa.bucket === 0) {
      if (pa.upperValue !== pb.upperValue) {
        return pb.upperValue - pa.upperValue;
      }
    } else if (pa.bucket === 1) {
      if (pa.lowerValue !== pb.lowerValue) {
        return pa.lowerValue - pb.lowerValue;
      }
    } else {
      if (pa.lowerValue !== pb.lowerValue) {
        return pa.lowerValue - pb.lowerValue;
      }
      if (pa.upperValue !== pb.upperValue) {
        return pa.upperValue - pb.upperValue;
      }
    }

    if (pa.containerName !== pb.containerName) {
      return pa.containerName < pb.containerName ? -1 : 1;
    }

    return a < b ? -1 : 1;
  };
}

/**
 * Ready-made comparator for `@media`/`@container` conditions using a 16px root for `rem`/`em`. For a
 * different root font size, use {@link createCompareCSSQueries}.
 *
 * @public
 */
export const compareCSSQueries: (a: string, b: string) => number = createCompareCSSQueries();
