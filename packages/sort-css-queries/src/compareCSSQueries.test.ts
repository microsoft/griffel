import { describe, expect, it } from 'vitest';

import { compareCSSQueries, createCompareCSSQueries } from './compareCSSQueries.js';

const sign = (n: number): number => (n < 0 ? -1 : n > 0 ? 1 : 0);

describe('compareCSSQueries', () => {
  describe('min-width / max-width (v1 parity)', () => {
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

    it('parses unitless zero (min-width: 0)', () => {
      expect(['(min-width: 720px)', '(min-width: 0)'].sort(compareCSSQueries)).toEqual([
        '(min-width: 0)',
        '(min-width: 720px)',
      ]);
    });
  });

  describe('min-height / max-height', () => {
    it('orders "min-height" ascending, not lexicographically (800 before 1000)', () => {
      // Lexicographically "1000" sorts before "800" — this must NOT happen.
      expect(['(min-height: 1000px)', '(min-height: 800px)'].sort(compareCSSQueries)).toEqual([
        '(min-height: 800px)',
        '(min-height: 1000px)',
      ]);
    });

    it('orders "max-height" descending', () => {
      expect(['(max-height: 800px)', '(max-height: 1023px)', '(max-height: 1024px)'].sort(compareCSSQueries)).toEqual([
        '(max-height: 1024px)',
        '(max-height: 1023px)',
        '(max-height: 800px)',
      ]);
    });

    it('groups width before height within the same bucket', () => {
      expect(['(min-height: 320px)', '(min-width: 480px)'].sort(compareCSSQueries)).toEqual([
        '(min-width: 480px)',
        '(min-height: 320px)',
      ]);
    });
  });

  describe('unsupported forms fall back to deterministic lexicographic', () => {
    // Range operators and bounded intervals are not read numerically — they carry no min-/max-
    // feature, so they land in the trailing non-size bucket and are ordered lexicographically.
    it('places range-operator conditions in the non-size bucket, after any min/max feature', () => {
      expect(compareCSSQueries('(min-width: 480px)', '(width > 720px)')).toBeLessThan(0);
      expect(compareCSSQueries('(max-width: 480px)', '(width < 720px)')).toBeLessThan(0);
    });

    it('orders unsupported forms deterministically (stable, not numerically)', () => {
      expect(['(width > 1024px)', '(width > 720px)'].sort(compareCSSQueries)).toEqual([
        '(width > 1024px)',
        '(width > 720px)',
      ]);
      expect(['(587px <= width <= 901px)', '(300px <= width <= 500px)'].sort(compareCSSQueries)).toEqual([
        '(300px <= width <= 500px)',
        '(587px <= width <= 901px)',
      ]);
    });
  });

  describe('"and" combinations', () => {
    it('treats a min/max band as a bounded range, ordered by lower bound', () => {
      const band = '(max-width: 730px) and (min-width: 513px)';
      const wider = '(max-width: 1200px) and (min-width: 900px)';
      expect([wider, band].sort(compareCSSQueries)).toEqual([band, wider]);
    });

    it('treats a cross-axis "and" of two lower bounds as mobile-first (lower-only bucket)', () => {
      const cross = '(min-width: 480px) and (min-height: 320px)';
      // Two lower bounds => lower-only bucket, sits after any max-only condition.
      expect(compareCSSQueries('(max-width: 480px)', cross)).toBeLessThan(0);
      // Ordered by the primary (width) lower bound ascending.
      const wider = '(min-width: 900px) and (min-height: 320px)';
      expect([wider, cross].sort(compareCSSQueries)).toEqual([cross, wider]);
    });
  });

  describe('container-name prefix', () => {
    it('parses widths regardless of a container name prefix', () => {
      expect(['foo (min-width: 720px)', 'foo (min-width: 480px)'].sort(compareCSSQueries)).toEqual([
        'foo (min-width: 480px)',
        'foo (min-width: 720px)',
      ]);
    });

    it('orders equal widths under different container names alphabetically by name', () => {
      expect(
        ['slot-container (min-width: 720px)', 'experience-layout-container (min-width: 720px)'].sort(compareCSSQueries),
      ).toEqual(['experience-layout-container (min-width: 720px)', 'slot-container (min-width: 720px)']);
    });

    it('sorts by width across container names before falling back to the name', () => {
      expect(
        ['slot-container (min-width: 480px)', 'experience-layout-container (min-width: 720px)'].sort(compareCSSQueries),
      ).toEqual(['slot-container (min-width: 480px)', 'experience-layout-container (min-width: 720px)']);
    });
  });

  describe('non-size conditions', () => {
    it('places style() queries in the trailing non-size bucket, ordered alphabetically', () => {
      expect(
        ['slot-container style(--end-header-height)', 'slot-container style(--x)'].sort(compareCSSQueries),
      ).toEqual(['slot-container style(--end-header-height)', 'slot-container style(--x)']);
    });

    it('orders style() after any sizing condition', () => {
      expect(compareCSSQueries('(min-width: 480px)', 'style(--x)')).toBeLessThan(0);
      expect(compareCSSQueries('(max-width: 480px)', 'style(--x)')).toBeLessThan(0);
    });

    it('falls back to a stable lexicographic comparison for non-parseable conditions', () => {
      expect(compareCSSQueries('sidebar', 'main')).toBeGreaterThan(0);
      expect(compareCSSQueries('(min-width: 480px)', '(min-width: 480px)')).toBe(0);
    });

    it('never throws on unexpected input', () => {
      const weird = ['', '()', '(min-width: abc)', '((', 'width', 'style()', '(min-width: 10vw)', ')(><'];
      for (const a of weird) {
        for (const b of weird) {
          expect(() => compareCSSQueries(a, b)).not.toThrow();
        }
      }
      expect(() => weird.sort(compareCSSQueries)).not.toThrow();
    });
  });

  describe('rem / em lengths (defensive normalization)', () => {
    it('converts rem to px against a 16px root so magnitudes still compare', () => {
      // 30rem => 480px, 45rem => 720px.
      expect(['(min-width: 45rem)', '(min-width: 30rem)'].sort(compareCSSQueries)).toEqual([
        '(min-width: 30rem)',
        '(min-width: 45rem)',
      ]);
      // 40rem (640px) should sit between 480px and 720px.
      expect(['(min-width: 720px)', '(min-width: 40rem)', '(min-width: 480px)'].sort(compareCSSQueries)).toEqual([
        '(min-width: 480px)',
        '(min-width: 40rem)',
        '(min-width: 720px)',
      ]);
    });
  });

  describe('createCompareCSSQueries({ rootFontSize })', () => {
    it('converts rem/em against a custom root font size (10px for font-size: 62.5%)', () => {
      const compare = createCompareCSSQueries({ rootFontSize: 10 });

      // With a 10px root: 48rem => 480px, 72rem => 720px.
      expect(['(min-width: 72rem)', '(min-width: 48rem)'].sort(compare)).toEqual([
        '(min-width: 48rem)',
        '(min-width: 72rem)',
      ]);
      // 64rem (640px at 10px root) sits between 480px and 720px.
      expect(['(min-width: 720px)', '(min-width: 64rem)', '(min-width: 480px)'].sort(compare)).toEqual([
        '(min-width: 480px)',
        '(min-width: 64rem)',
        '(min-width: 720px)',
      ]);
    });

    it('produces a different order than the 16px default for the same rem inputs', () => {
      const atTen = createCompareCSSQueries({ rootFontSize: 10 });

      // 50rem is 500px at a 10px root (before 720px) but 800px at 16px (after 720px).
      expect([...['(min-width: 720px)', '(min-width: 50rem)']].sort(atTen)).toEqual([
        '(min-width: 50rem)',
        '(min-width: 720px)',
      ]);
      expect([...['(min-width: 720px)', '(min-width: 50rem)']].sort(compareCSSQueries)).toEqual([
        '(min-width: 720px)',
        '(min-width: 50rem)',
      ]);
    });

    it('defaults to a 16px root when no options are provided', () => {
      const compare = createCompareCSSQueries();

      // 45rem => 720px at the default root: after 480px, before 1024px.
      expect(compare('(min-width: 45rem)', '(min-width: 480px)')).toBeGreaterThan(0);
      expect(compare('(min-width: 45rem)', '(min-width: 1024px)')).toBeLessThan(0);
    });
  });

  describe('total order (property / fuzz)', () => {
    // A representative, magnitude-spanning corpus mixing every supported form.
    const CORPUS = [
      '(min-width: 0)',
      '(min-width: 320px)',
      '(min-width: 480px)',
      '(min-width: 720px)',
      '(min-width: 1024px)',
      '(min-width: 3840px)',
      '(max-width: 320px)',
      '(max-width: 480px)',
      '(max-width: 640px)',
      '(max-width: 1024px)',
      '(min-height: 320px)',
      '(min-height: 800px)',
      '(min-height: 1024px)',
      '(max-height: 480px)',
      '(max-height: 1023px)',
      '(width > 200px)',
      '(width >= 587px)',
      '(width < 500px)',
      '(width <= 901px)',
      '(height > 300px)',
      '(height < 600px)',
      '(587px <= width <= 901px)',
      '(300px <= width <= 500px)',
      '(max-width: 730px) and (min-width: 513px)',
      '(min-width: 480px) and (min-height: 320px)',
      '(min-width: 900px) and (min-height: 320px)',
      'slot-container (min-width: 720px)',
      'experience-layout-container (min-width: 720px)',
      'slot-container (min-width: 480px)',
      'slot-container style(--end-header-height)',
      'slot-container style(--x)',
      'style(--x)',
      'sidebar',
      'main',
      '(min-width: 45rem)',
      '(min-width: 30rem)',
    ];

    it('is reflexive: compare(a, a) === 0', () => {
      for (const a of CORPUS) {
        expect(compareCSSQueries(a, a)).toBe(0);
      }
    });

    it('is antisymmetric: sign(compare(a, b)) === -sign(compare(b, a))', () => {
      for (const a of CORPUS) {
        for (const b of CORPUS) {
          expect(sign(compareCSSQueries(a, b))).toBe(sign(-compareCSSQueries(b, a)));
        }
      }
    });

    it('is transitive: if compare(a, b) <= 0 and compare(b, c) <= 0 then compare(a, c) <= 0', () => {
      for (const a of CORPUS) {
        for (const b of CORPUS) {
          for (const c of CORPUS) {
            if (compareCSSQueries(a, b) <= 0 && compareCSSQueries(b, c) <= 0) {
              expect(compareCSSQueries(a, c)).toBeLessThanOrEqual(0);
            }
          }
        }
      }
    });

    it('produces a stable, deterministic sort across every permutation of a small sample', () => {
      const sample = CORPUS.slice(0, 8);
      const expected = [...sample].sort(compareCSSQueries);

      // Shuffle in several known orders and verify they all converge to the same result.
      const permutations = [
        [...sample].reverse(),
        [sample[3], sample[0], sample[7], sample[1], sample[5], sample[2], sample[6], sample[4]],
        [...sample].sort(() => 0.5 - Math.random()),
      ];

      for (const permutation of permutations) {
        expect(permutation.sort(compareCSSQueries)).toEqual(expected);
      }
    });
  });
});

