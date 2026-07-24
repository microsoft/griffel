import { describe, expect, it } from 'vitest';

import { createLineOffsetTable } from './sourceLocation.mjs';

describe('createLineOffsetTable', () => {
  it('resolves offsets on the first line', () => {
    const table = createLineOffsetTable('const a = 1;');

    expect(table.locate(0, 5)).toEqual({
      start: { line: 1, column: 0, index: 0 },
      end: { line: 1, column: 5, index: 5 },
    });
  });

  it('resolves offsets on later lines relative to their line start', () => {
    const source = ['const a = 1;', 'const b = 2;'].join('\n');
    const table = createLineOffsetTable(source);

    const start = source.indexOf('const b');
    const end = source.length;

    expect(table.locate(start, end)).toEqual({
      start: { line: 2, column: 0, index: start },
      end: { line: 2, column: 12, index: end },
    });
  });

  it('resolves a range spanning several lines', () => {
    // Offsets: a=0, \n=1, b=2, b=3, \n=4, c=5, c=6, c=7 (length 8).
    const table = createLineOffsetTable(['a', 'bb', 'ccc'].join('\n'));

    expect(table.locate(0, 8)).toEqual({
      start: { line: 1, column: 0, index: 0 },
      end: { line: 3, column: 3, index: 8 },
    });
  });
});
