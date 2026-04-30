import { describe, expect, it, vi } from 'vitest';
import { griffelResetRulesSerializer } from '../common/snapshotSerializers.js';
import { resolveResetStyleRules } from './resolveResetStyleRules.js';

expect.addSnapshotSerializer(griffelResetRulesSerializer);

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

  it('handles @scope to (.boundary) to a root', () => {
    const result = resolveResetStyleRules({
      color: 'black',
      '@scope to (.boundary)': {
        color: 'red',
      },
    });

    expect(result).toMatchInlineSnapshot(`
      /** bucket "r" */
      .rpi6lny {
        color: black;
      }
      @scope (.rpi6lny) to (.boundary) {
        :scope {
          color: red;
        }
      }
    `);
  });

  it('handles @scope to (.boundary) with descendant selector', () => {
    const result = resolveResetStyleRules({
      color: 'black',
      '@scope to (.boundary)': {
        '& p': { color: 'red' },
      },
    });

    expect(result).toMatchInlineSnapshot(`
      /** bucket "r" */
      .rriligx {
        color: black;
      }
      @scope (.rriligx) to (.boundary) {
        :scope p {
          color: red;
        }
      }
    `);
  });

  it('handles direct property inside @scope (styles the reset root)', () => {
    const result = resolveResetStyleRules({
      '@scope to (.never)': { color: 'blue' },
    });

    expect(result).toMatchInlineSnapshot(`
      /** bucket "r" */
      @scope (.r1he02t7) to (.never) {
        :scope {
          color: blue;
        }
      }
    `);
  });

  it('hoists @media out of @scope so authoring order does not change emitted CSS', () => {
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

    expect(resultA).toEqual(resultB);
    expect(resultA).toMatchInlineSnapshot(`
      /** bucket "s" */
      @media (max-width: 600px) {
        @scope (.rrl1mxq) to (.mobile) {
          :scope {
            color: red;
          }
          :scope .child {
            color: green;
          }
        }
      }
    `);
  });

  it('handles RTL-flipped property under @scope', () => {
    const result = resolveResetStyleRules({
      paddingLeft: '5px',
      '@scope to (.boundary)': {
        '& .child': { paddingLeft: '10px' },
      },
    });

    expect(result).toMatchInlineSnapshot(`
      /** bucket "r" */
      .ryla0gh {
        padding-left: 5px;
      }
      @scope (.ryla0gh) to (.boundary) {
        :scope .child {
          padding-left: 10px;
        }
      }
      .rprwo7s {
        padding-right: 5px;
      }
      @scope (.rprwo7s) to (.boundary) {
        :scope .child {
          padding-right: 10px;
        }
      }
    `);
  });

  it('emits two sibling @scope rules for two top-level @scope blocks', () => {
    const result = resolveResetStyleRules({
      '@scope to (.a)': { '& p': { color: 'red' } },
      '@scope to (.b)': { '& p': { color: 'blue' } },
    });

    expect(result).toMatchInlineSnapshot(`
      /** bucket "r" */
      @scope (.ryjssdl) to (.a) {
        :scope p {
          color: red;
        }
      }
      @scope (.ryjssdl) to (.b) {
        :scope p {
          color: blue;
        }
      }
    `);
  });
});
