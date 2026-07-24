import type { TransformMetadataSourceLocation } from './types.mjs';

export type LineOffsetTable = {
  /** Resolves a `[start, end)` byte range into a source location with line/column positions. */
  locate(start: number, end: number): TransformMetadataSourceLocation;
};

/**
 * Precomputes the byte offset of every line start in `source`, enabling fast
 * offset → { line, column } lookups via binary search.
 */
export function createLineOffsetTable(source: string): LineOffsetTable {
  const lineStartOffsets = computeLineStartOffsets(source);

  function positionAt(offset: number) {
    // Binary search for the line whose start offset is closest to (but not after) `offset`.
    let low = 0;
    let high = lineStartOffsets.length - 1;

    while (low < high) {
      const middle = (low + high + 1) >> 1;

      if (lineStartOffsets[middle] <= offset) {
        low = middle;
      } else {
        high = middle - 1;
      }
    }

    return { line: low + 1, column: offset - lineStartOffsets[low], index: offset };
  }

  return {
    locate(start, end) {
      return { start: positionAt(start), end: positionAt(end) };
    },
  };
}

function computeLineStartOffsets(source: string): number[] {
  const offsets = [0];

  for (let index = 0; index < source.length; index++) {
    if (source[index] === '\n') {
      offsets.push(index + 1);
    }
  }

  return offsets;
}
