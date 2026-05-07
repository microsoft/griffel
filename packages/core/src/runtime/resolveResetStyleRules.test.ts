import { describe, it, expect } from 'vitest';
import { resolveResetStyleRules } from './resolveResetStyleRules.js';
import '../common/snapshotMatchers.js';

describe('resolveResetStyleRules', () => {
  it('handles base rules', async () => {
    const result = resolveResetStyleRules({
      color: 'red',
      overflowX: 'hidden',
    });

    await expect(result).toMatchFormattedInlineSnapshot(`
      "/** bucket "r" */
      .r11y0rml {
        color: red;
        overflow-x: hidden;
      }"
    `);
  });

  it('handles RTL', async () => {
    const result = resolveResetStyleRules({ marginLeft: '15px' });

    await expect(result).toMatchFormattedInlineSnapshot(`
      "/** bucket "r" */
      .rovwgyn {
        margin-left: 15px;
      }
      .rj5b9iu {
        margin-right: 15px;
      }"
    `);
  });

  it('handles fallback values', async () => {
    const result = resolveResetStyleRules({
      color: ['red', 'blue'],
    });

    await expect(result).toMatchFormattedInlineSnapshot(`
      "/** bucket "r" */
      .rj1urkn {
        color: red;
        color: blue;
      }"
    `);
  });

  it('handles :global() selector', async () => {
    await expect(
      resolveResetStyleRules({
        color: 'red',
        ':global(body)': { color: 'magenta' },
      }),
    ).toMatchFormattedInlineSnapshot(`
      "/** bucket "r" */
      .rzlpwqs {
        color: red;
      }
      body .rzlpwqs {
        color: magenta;
      }"
    `);

    await expect(
      resolveResetStyleRules({
        ':global(body)': {
          color: 'magenta',
          ':focus': { color: 'pink' },
        },
      }),
    ).toMatchFormattedInlineSnapshot(`
      "/** bucket "r" */
      body .r1i1zh9k {
        color: magenta;
      }
      body .r1i1zh9k:focus {
        color: pink;
      }"
    `);

    await expect(
      resolveResetStyleRules({
        ':global(.fui-FluentProvider)': {
          '& .foo': { color: 'orange' },
        },
      }),
    ).toMatchFormattedInlineSnapshot(`
      "/** bucket "r" */
      .fui-FluentProvider .rmi35r5 .foo {
        color: orange;
      }"
    `);
  });

  it('handles named container queries', async () => {
    const result = resolveResetStyleRules({
      '@container foo (max-width: 1px)': {
        color: 'orange',
      },
    });

    await expect(result).toMatchFormattedInlineSnapshot(`
      "/** bucket "s" */
      @container foo (max-width: 1px) {
        .rmph5rz {
          color: orange;
        }
      }"
    `);
  });

  it('handles unnamed container queries', async () => {
    const result = resolveResetStyleRules({
      '@container (max-width: 1px)': {
        color: 'orange',
      },
    });

    await expect(result).toMatchFormattedInlineSnapshot(`
      "/** bucket "s" */
      @container (max-width: 1px) {
        .r1ph1abo {
          color: orange;
        }
      }"
    `);
  });

  it('handles media queries', async () => {
    const result = resolveResetStyleRules({
      color: 'red',
      '@media (forced-colors: active)': {
        color: 'orange',
        ':focus': {
          color: 'yellow',
        },
      },
    });

    await expect(result).toMatchFormattedInlineSnapshot(`
      "/** bucket "r" */
      .rpycl1b {
        color: red;
      }
      /** bucket "s" */
      @media (forced-colors: active) {
        .rpycl1b {
          color: orange;
        }
        .rpycl1b:focus {
          color: yellow;
        }
      }"
    `);
  });

  it('handles layer queries', async () => {
    const result = resolveResetStyleRules({
      '@layer utilities': {
        color: 'orange',
        ':focus': {
          color: 'yellow',
        },
      },
    });

    await expect(result).toMatchFormattedInlineSnapshot(`
      "/** bucket "s" */
      @layer utilities {
        .rvhnavh {
          color: orange;
        }
        .rvhnavh:focus {
          color: yellow;
        }
      }"
    `);
  });

  it('handles support queries', async () => {
    const result = resolveResetStyleRules({
      '@supports (display: flex)': {
        color: 'orange',
        ':focus': {
          color: 'yellow',
        },
      },
    });

    await expect(result).toMatchFormattedInlineSnapshot(`
      "/** bucket "s" */
      @supports (display: flex) {
        .rxf8lon {
          color: orange;
        }
        .rxf8lon:focus {
          color: yellow;
        }
      }"
    `);
  });

  it('handles nested queries queries', async () => {
    const result = resolveResetStyleRules({
      '@supports (display: flex)': {
        color: 'pink',

        '@media (forced-colors: active)': {
          color: 'orange',
        },
      },
    });

    await expect(result).toMatchFormattedInlineSnapshot(`
      "/** bucket "s" */
      @supports (display: flex) {
        .rhd25ja {
          color: pink;
        }
        @media (forced-colors: active) {
          .rhd25ja {
            color: orange;
          }
        }
      }"
    `);
  });

  it('handles nested selectors', async () => {
    const result = resolveResetStyleRules({
      ':hover': { color: 'red' },
      '& :focus': { color: 'red' },
      '&.foo': { color: 'red' },
    });

    await expect(result).toMatchFormattedInlineSnapshot(`
      "/** bucket "r" */
      .r1s1f2pl:hover {
        color: red;
      }
      .r1s1f2pl :focus {
        color: red;
      }
      .r1s1f2pl.foo {
        color: red;
      }"
    `);
  });

  describe('animationName', () => {
    it('supports strings', async () => {
      const result = resolveResetStyleRules({
        animationName: 'foo',
      });

      await expect(result).toMatchFormattedInlineSnapshot(`
        "/** bucket "r" */
        .reh730q {
          animation-name: foo;
        }"
      `);
    });

    it('supports objects', async () => {
      const result = resolveResetStyleRules({
        animationName: {
          from: { height: '10px' },
          to: { height: '20px' },
        },
      });

      await expect(result).toMatchFormattedInlineSnapshot(`
        "/** bucket "r" */
        .rgmpmil {
          animation-name: r1kgwxhb;
        }
        @keyframes r1kgwxhb {
          from {
            height: 10px;
          }
          to {
            height: 20px;
          }
        }
        .r1u04j3e {
          animation-name: r1kgwxhb;
        }"
      `);
    });

    it('supports arrays', async () => {
      const result = resolveResetStyleRules({
        animationName: [
          {
            from: { top: 0 },
            to: { top: '100px' },
          },
          {
            from: { opacity: '0' },
            to: { opacity: '1' },
          },
        ],
      });

      await expect(result).toMatchFormattedInlineSnapshot(`
        "/** bucket "r" */
        .rw8vs22 {
          animation-name: r1sekkel, r5j8bii;
        }
        @keyframes r1sekkel {
          from {
            top: 0;
          }
          to {
            top: 100px;
          }
        }
        @keyframes r5j8bii {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .rcoo9tn {
          animation-name: r1sekkel, r5j8bii;
        }"
      `);
    });
  });
});
