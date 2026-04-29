import { describe, expect, it, vi } from 'vitest';
import { griffelRulesSerializer } from '../common/snapshotSerializers.js';
import { resolveStyleRules } from './resolveStyleRules.js';

expect.addSnapshotSerializer(griffelRulesSerializer);

describe('resolveStyleRules: @scope', () => {
  describe('warnings', () => {
    it('warns and skips bare @scope without a prelude', () => {
      const error = vi.spyOn(console, 'error').mockImplementationOnce(() => {});

      const result = resolveStyleRules({ '@scope': { color: 'red' } });

      expect(error).toHaveBeenCalledWith(expect.stringMatching(/@scope.*not a supported/));

      // No styles emitted
      expect(result[0]).toEqual({});
      expect(result[1]).toEqual({});
    });

    it('warns and skips @scope with explicit root selector', () => {
      const error = vi.spyOn(console, 'error').mockImplementationOnce(() => {});

      const result = resolveStyleRules({ '@scope (&)': { '& .child': { color: 'red' } } });

      expect(error).toHaveBeenCalledWith(expect.stringMatching(/@scope.*not a supported/));

      expect(result[0]).toEqual({});
      expect(result[1]).toEqual({});
    });

    it('warns and skips @scope (&) to (.boundary) syntax', () => {
      const error = vi.spyOn(console, 'error').mockImplementationOnce(() => {});

      const result = resolveStyleRules({
        '@scope (&) to (.boundary)': { '& .child': { color: 'red' } },
      });

      expect(error).toHaveBeenCalledWith(expect.stringMatching(/@scope.*not a supported/));

      expect(result[0]).toEqual({});
      expect(result[1]).toEqual({});
    });

    it('warns and skips a nested @scope inside another @scope', () => {
      const error = vi.spyOn(console, 'error').mockImplementationOnce(() => {});

      const result = resolveStyleRules({
        '@scope to (.outer)': {
          '@scope to (.inner)': { color: 'red' },
        },
      });

      expect(error).toHaveBeenCalledWith(expect.stringMatching(/nested.*@scope.*not supported/));

      // Outer @scope still resolves, inner is dropped — no rules emitted because the inner block was the only payload.
      expect(result[0]).toEqual({});
      expect(result[1]).toEqual({});
    });
  });

  it('handles @scope to (.boundary) with child selector', () => {
    const result = resolveStyleRules({
      '@scope to (.scope-boundary)': {
        '& .child': { color: 'blue' },
      },
    });

    expect(result).toMatchInlineSnapshot(`
      @scope (.f1me1298) to (.scope-boundary) {
        :scope .child {
          color: blue;
        }
      }
    `);
  });

  it("scope queries don't collide with regular properties", () => {
    const result = resolveStyleRules({
      color: 'red',
      '@scope to (.boundary)': { '& .child': { color: 'red' } },
    });

    expect(result[0]).toMatchInlineSnapshot(`
      {
        "otwrnl": "f1jrof0",
        "sj55zd": "fe3e8s9",
      }
    `);
  });

  // --- Nesting @scope with other at-rules ---

  it('@scope inside @media produces @media wrapping @scope', () => {
    const result = resolveStyleRules({
      '@media (max-width: 600px)': {
        '@scope to (.boundary)': {
          '& p': { color: 'red' },
        },
      },
    });

    expect(result).toMatchInlineSnapshot(`
      @media (max-width: 600px) {
        @scope (.fan1v9k) to (.boundary) {
          :scope p {
            color: red;
          }
        }
      }
    `);
  });

  it('@scope inside @supports produces @supports wrapping @scope', () => {
    const result = resolveStyleRules({
      '@supports (display: grid)': {
        '@scope to (.boundary)': {
          '& p': { color: 'blue' },
        },
      },
    });

    expect(result).toMatchInlineSnapshot(`
      @supports (display: grid) {
        @scope (.fc037k5) to (.boundary) {
          :scope p {
            color: blue;
          }
        }
      }
    `);
  });

  it('@scope inside @container produces @container wrapping @scope', () => {
    const result = resolveStyleRules({
      '@container (min-width: 400px)': {
        '@scope to (.boundary)': {
          '& p': { color: 'green' },
        },
      },
    });

    expect(result).toMatchInlineSnapshot(`
      @container (min-width: 400px) {
        @scope (.f1pbgmbw) to (.boundary) {
          :scope p {
            color: green;
          }
        }
      }
    `);
  });

  it('@scope inside @layer produces @layer wrapping @scope', () => {
    const result = resolveStyleRules({
      '@layer utilities': {
        '@scope to (.boundary)': {
          '& p': { color: 'purple' },
        },
      },
    });

    expect(result).toMatchInlineSnapshot(`
      @layer utilities {
        @scope (.f1o8gmm1) to (.boundary) {
          :scope p {
            color: purple;
          }
        }
      }
    `);
  });

  // --- RTL ---

  it('handles RTL-flipped property under @scope', () => {
    const result = resolveStyleRules({
      '@scope to (.boundary)': {
        '& .child': { paddingLeft: '10px' },
      },
    });

    expect(result).toMatchInlineSnapshot(`
      @scope (.flgw30a) to (.boundary) {
        :scope .child {
          padding-left: 10px;
        }
      }
      @scope (.f1l5b952) to (.boundary) {
        :scope .child {
          padding-right: 10px;
        }
      }
    `);
  });

  // --- Property collisions ---

  it('same property scoped and non-scoped produce independent classes', () => {
    const result = resolveStyleRules({
      color: 'red',
      '@scope to (.boundary)': { color: 'blue' },
    });

    expect(result[0]).toMatchInlineSnapshot(`
      {
        "fjumov": "f14r3iqv",
        "sj55zd": "fe3e8s9",
      }
    `);

    // Both non-scoped and scoped without pseudo go to 'd'
    expect(result[1]).toHaveProperty('d');
  });

  it('same property in two different @scope blocks produce independent classes', () => {
    const result = resolveStyleRules({
      '@scope to (.a)': { '& p': { color: 'red' } },
      '@scope to (.b)': { '& p': { color: 'blue' } },
    });

    expect(result[0]).toMatchInlineSnapshot(`
      {
        "B9rlkkj": "fh4gkgn",
        "Bpguliw": "ff6bx43",
      }
    `);
  });

  // --- Boundary edge cases ---

  it('handles complex boundary selector', () => {
    const result = resolveStyleRules({
      '@scope to (.boundary > *)': {
        '& img': { borderRadius: '50%' },
      },
    });

    expect(result).toMatchInlineSnapshot(`
      @scope (.fm436sz) to (.boundary > *) {
        :scope img {
          border-radius: 50%;
        }
      }
    `);
  });

  // --- Nested selectors inside @scope ---

  it('handles pseudo-selectors inside @scope', () => {
    const result = resolveStyleRules({
      '@scope to (.boundary)': {
        '& a:hover': { color: 'blue' },
      },
    });

    expect(result).toMatchInlineSnapshot(`
      @scope (.f12tnm6c) to (.boundary) {
        :scope a:hover {
          color: blue;
        }
      }
    `);
  });

  it('scoped :hover with boundary goes to "h" bucket', () => {
    const result = resolveStyleRules({
      '@scope to (.boundary)': {
        ':hover': { color: 'cyan' },
      },
    });

    expect(result[1]).toHaveProperty('h');
    expect(result).toMatchInlineSnapshot(`
      @scope (.f1sje2gt) to (.boundary) {
        :scope:hover {
          color: cyan;
        }
      }
    `);
  });

  it('scoped :focus with boundary goes to "f" bucket', () => {
    const result = resolveStyleRules({
      '@scope to (.boundary)': {
        ':focus': { color: 'yellow' },
      },
    });

    expect(result[1]).toHaveProperty('f');
  });

  it('scoped :active with boundary goes to "a" bucket', () => {
    const result = resolveStyleRules({
      '@scope to (.boundary)': {
        ':active': { color: 'orange' },
      },
    });

    expect(result[1]).toHaveProperty('a');
  });

  it('LVHA ordering preserved: scoped :hover and :focus go to separate buckets', () => {
    const result = resolveStyleRules({
      '@scope to (.boundary)': {
        ':hover': { color: 'cyan' },
        ':focus': { color: 'yellow' },
      },
    });

    // :hover → 'h' bucket, :focus → 'f' bucket — LVHA ordering preserved
    expect(result[1]).toHaveProperty('h');
    expect(result[1]).toHaveProperty('f');
  });

  it('handles multiple properties inside @scope', () => {
    const result = resolveStyleRules({
      '@scope to (.boundary)': {
        '& p': { color: 'red', fontSize: '14px' },
      },
    });

    // Two properties = two atomic classes
    expect(result[0]).toMatchInlineSnapshot(`
      {
        "hth0cq": "f7t33c5",
        "rxd53p": "fbtjt56",
      }
    `);

    // Both go to 'd' bucket (no pseudo selector on '& p')
    expect(result[1].d!.length).toBe(2);
  });

  // --- Direct root styling ---

  it('handles direct property inside @scope (styles the scope root)', () => {
    const result = resolveStyleRules({
      '@scope to (.boundary)': { color: 'blue' },
    });

    expect(result).toMatchInlineSnapshot(`
      @scope (.f14r3iqv) to (.boundary) {
        :scope {
          color: blue;
        }
      }
    `);
  });

  // --- Cascade ordering: scoped vs non-scoped same property ---

  it('non-scoped then scoped: produces independent rules in same bucket', () => {
    const result = resolveStyleRules({
      color: 'red',
      '@scope to (.boundary)': { color: 'blue' },
    });

    // Both non-scoped and scoped (no pseudo) go to 'd' bucket
    expect(result[1]).toHaveProperty('d');
    expect(result).toMatchInlineSnapshot(`
      .fe3e8s9 {
        color: red;
      }
      @scope (.f14r3iqv) to (.boundary) {
        :scope {
          color: blue;
        }
      }
    `);
  });

  it('scoped then non-scoped: same bucket, insertion order', () => {
    const result = resolveStyleRules({
      '@scope to (.boundary)': { color: 'blue' },
      color: 'red',
    });

    // Both non-scoped and scoped (no pseudo) go to 'd' bucket
    expect(result[1]).toHaveProperty('d');
    expect(result).toMatchInlineSnapshot(`
      @scope (.f14r3iqv) to (.boundary) {
        :scope {
          color: blue;
        }
      }
      .fe3e8s9 {
        color: red;
      }
    `);
  });

  it('two scoped rules with same property: last one wins (same bucket, source order)', () => {
    const result = resolveStyleRules({
      '@scope to (.a)': { color: 'red' },
      '@scope to (.b)': { color: 'blue' },
    });

    // Both in 'd' bucket (no pseudo), blue comes second
    expect(result).toMatchInlineSnapshot(`
      @scope (.f1ppphex) to (.a) {
        :scope {
          color: red;
        }
      }
      @scope (.f11yypxt) to (.b) {
        :scope {
          color: blue;
        }
      }
    `);

    // But in Griffel's atomic model, the LAST class wins via mergeClasses.
    // Only one of the two atomic classes will be on the element at runtime.
    expect(result[0]).toMatchInlineSnapshot(`
      {
        "Bsba2g1": "f11yypxt",
        "xqz3n8": "f1ppphex",
      }
    `);
  });
});
