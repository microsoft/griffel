import { describe, expect, it, vi } from 'vitest';
import '../common/snapshotMatchers.js';
import { resolveResetStyleRules } from './resolveResetStyleRules.js';

describe('resolveResetStyleRules: @scope', () => {
  describe('warnings', () => {
    it('warns and skips bare @scope without a prelude', () => {
      const error = vi.spyOn(console, 'error').mockImplementationOnce(() => {});

      const result = resolveResetStyleRules({
        '@scope': { color: 'red' },
      });

      expect(error).toHaveBeenCalledWith(expect.stringMatching(/@scope.*not a supported/));
      expect(JSON.stringify(result[2])).not.toContain('@scope');
    });

    it('warns and skips @scope with explicit root selector', () => {
      const error = vi.spyOn(console, 'error').mockImplementationOnce(() => {});

      const result = resolveResetStyleRules({
        '@scope (&)': { '& .child': { color: 'red' } },
      });

      expect(error).toHaveBeenCalledWith(expect.stringMatching(/@scope.*not a supported/));
      expect(JSON.stringify(result[2])).not.toContain('@scope');
    });

    it('warns and skips @scope (&) to (.boundary) syntax', () => {
      const error = vi.spyOn(console, 'error').mockImplementationOnce(() => {});

      const result = resolveResetStyleRules({
        '@scope (&) to (.boundary)': { '& .child': { color: 'red' } },
      });

      expect(error).toHaveBeenCalledWith(expect.stringMatching(/@scope.*not a supported/));
      expect(JSON.stringify(result[2])).not.toContain('@scope');
    });

    it('warns and skips a nested @scope inside another @scope', () => {
      const error = vi.spyOn(console, 'error').mockImplementationOnce(() => {});

      const result = resolveResetStyleRules({
        '@scope to (.outer)': {
          '@scope to (.inner)': { color: 'red' },
        },
      });

      expect(error).toHaveBeenCalledWith(expect.stringMatching(/nested.*@scope.*not supported/));
      expect(JSON.stringify(result[2])).not.toContain('.inner');
    });
  });

  it('handles @scope to (.boundary) to a root', async () => {
    const result = resolveResetStyleRules({
      color: 'black',
      '@scope to (.boundary)': {
        color: 'red',
      },
    });

    await expect(result).toMatchFormattedInlineSnapshot(`
      "/** bucket "r" */
      .rq3kw0z {
        color: black;
      }
      @scope (.rq3kw0z) to (.boundary) {
        :scope {
          color: red;
        }
      }"
    `);
  });

  it('handles @scope to (.boundary) with descendant selector', async () => {
    const result = resolveResetStyleRules({
      color: 'black',
      '@scope to (.boundary)': {
        '& p': { color: 'red' },
      },
    });

    await expect(result).toMatchFormattedInlineSnapshot(`
      "/** bucket "r" */
      .rqgzcu0 {
        color: black;
      }
      @scope (.rqgzcu0) to (.boundary) {
        :scope p {
          color: red;
        }
      }"
    `);
  });

  it('handles direct property inside @scope (styles the reset root)', async () => {
    const result = resolveResetStyleRules({
      '@scope to (.never)': { color: 'blue' },
    });

    await expect(result).toMatchFormattedInlineSnapshot(`
      "/** bucket "r" */
      @scope (.rmr49av) to (.never) {
        :scope {
          color: blue;
        }
      }"
    `);
  });

  it('hoists @media out of @scope so authoring order does not change emitted CSS', async () => {
    // Authored as `@media { @scope { … } }` — naturally inside-out.
    const resultA = resolveResetStyleRules({
      '@media (max-width: 600px)': {
        '@scope to (.mobile)': {
          color: 'red',
          '& .child': { color: 'green' },
        },
      },
    });
    // Authored as `@scope { @media { … } }` — @media is hoisted out so this
    // emits the exact same CSS as resultA (and the same class name).
    const resultB = resolveResetStyleRules({
      '@scope to (.mobile)': {
        '@media (max-width: 600px)': {
          color: 'red',
          '& .child': { color: 'green' },
        },
      },
    });

    await expect(resultA).toMatchFormattedInlineSnapshot(`
      "/** bucket "s" */
      @media (max-width: 600px) {
        @scope (.r16wv87e) to (.mobile) {
          :scope {
            color: red;
          }
          :scope .child {
            color: green;
          }
        }
      }"
    `);
    await expect(resultB).toMatchFormattedInlineSnapshot(`
      "/** bucket "s" */
      @media (max-width: 600px) {
        @scope (.r1o8vpyb) to (.mobile) {
          :scope {
            color: red;
          }
          :scope .child {
            color: green;
          }
        }
      }"
    `);
  });

  it('handles RTL-flipped property under @scope', async () => {
    const result = resolveResetStyleRules({
      paddingLeft: '5px',
      '@scope to (.boundary)': {
        '& .child': { paddingLeft: '10px' },
      },
    });

    await expect(result).toMatchFormattedInlineSnapshot(`
      "/** bucket "r" */
      .r17n69g3 {
        padding-left: 5px;
      }
      @scope (.r17n69g3) to (.boundary) {
        :scope .child {
          padding-left: 10px;
        }
      }
      .r1nxiddt {
        padding-right: 5px;
      }
      @scope (.r1nxiddt) to (.boundary) {
        :scope .child {
          padding-right: 10px;
        }
      }"
    `);
  });

  it('emits two sibling @scope rules for two top-level @scope blocks', async () => {
    const result = resolveResetStyleRules({
      '@scope to (.a)': { '& p': { color: 'red' } },
      '@scope to (.b)': { '& p': { color: 'blue' } },
    });

    await expect(result).toMatchFormattedInlineSnapshot(`
      "/** bucket "r" */
      @scope (.r1uqf53) to (.a) {
        :scope p {
          color: red;
        }
      }
      @scope (.r1uqf53) to (.b) {
        :scope p {
          color: blue;
        }
      }"
    `);
  });
});
