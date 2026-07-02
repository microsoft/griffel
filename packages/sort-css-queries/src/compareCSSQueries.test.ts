import { describe, expect, it } from 'vitest';

import { compareCSSQueries } from './compareCSSQueries.js';

describe('compareCSSQueries', () => {
  it('orders "min-width" conditions ascending (mobile-first)', () => {
    expect(['(min-width: 720px)', '(min-width: 480px)', '(min-width: 1024px)'].sort(compareCSSQueries)).toEqual([
      '(min-width: 480px)',
      '(min-width: 720px)',
      '(min-width: 1024px)',
    ]);
  });

  it('orders by numeric value, not lexicographically (720 before 1024)', () => {
    // A naive lexicographic comparison would place "1024px" before "720px".
    expect(compareCSSQueries('(min-width: 720px)', '(min-width: 1024px)')).toBeLessThan(0);
  });

  it('parses decimal widths (1024px before 1024.01px)', () => {
    expect(['(min-width: 1024.01px)', '(min-width: 1024px)'].sort(compareCSSQueries)).toEqual([
      '(min-width: 1024px)',
      '(min-width: 1024.01px)',
    ]);
    expect(compareCSSQueries('(min-width: 1024px)', '(min-width: 1024.01px)')).toBeLessThan(0);
  });

  it('parses widths regardless of a container name prefix', () => {
    expect(['foo (min-width: 720px)', 'foo (min-width: 480px)'].sort(compareCSSQueries)).toEqual([
      'foo (min-width: 480px)',
      'foo (min-width: 720px)',
    ]);
  });

  it('orders "max-width" conditions descending (desktop-first)', () => {
    expect(['(max-width: 480px)', '(max-width: 1024px)', '(max-width: 720px)'].sort(compareCSSQueries)).toEqual([
      '(max-width: 1024px)',
      '(max-width: 720px)',
      '(max-width: 480px)',
    ]);
  });

  it('orders "max-width" before "min-width"', () => {
    expect(compareCSSQueries('(max-width: 480px)', '(min-width: 480px)')).toBeLessThan(0);
  });

  it('falls back to a stable lexicographic comparison for non-width or equal conditions', () => {
    // No parseable width => deterministic alphabetical order.
    expect(compareCSSQueries('sidebar', 'main')).toBeGreaterThan(0);
    // Equal width, different container names => alphabetical.
    expect(compareCSSQueries('a (min-width: 480px)', 'b (min-width: 480px)')).toBeLessThan(0);
    expect(compareCSSQueries('(min-width: 480px)', '(min-width: 480px)')).toBe(0);
  });
});
