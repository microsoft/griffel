import { resolveResetStyleRules } from './resolveResetStyleRules';
import { griffelResetRulesSerializer } from '../common/snapshotSerializers';

expect.addSnapshotSerializer(griffelResetRulesSerializer);

describe('resolveResetStyleRules', () => {
  it('handles base rules', () => {
    const result = resolveResetStyleRules({
      color: 'red',
      overflowX: 'hidden',
    });

    expect(result).toMatchInlineSnapshot(`
      .r11y0rml {
        color: red;
        overflow-x: hidden;
      }
    `);
  });

  it('handles RTL', () => {
    const result = resolveResetStyleRules({ marginLeft: '15px' });

    expect(result).toMatchInlineSnapshot(`
      .rovwgyn {
        margin-left: 15px;
      }
      .rj5b9iu {
        margin-right: 15px;
      }
    `);
  });

  it('handles fallback values', () => {
    const result = resolveResetStyleRules({
      color: ['red', 'blue'],
    });

    expect(result).toMatchInlineSnapshot(`
      .rj1urkn {
        color: red;
        color: blue;
      }
    `);
  });

  it('handles :global() selector', () => {
    expect(
      resolveResetStyleRules({
        color: 'red',
        ':global(body)': { color: 'magenta' },
      }),
    ).toMatchInlineSnapshot(`
      .rzlpwqs {
        color: red;
      }
      body .rzlpwqs {
        color: magenta;
      }
    `);

    expect(
      resolveResetStyleRules({
        ':global(body)': {
          color: 'magenta',
          ':focus': { color: 'pink' },
        },
      }),
    ).toMatchInlineSnapshot(`
      body .r1i1zh9k {
        color: magenta;
      }
      body .r1i1zh9k:focus {
        color: pink;
      }
    `);

    expect(
      resolveResetStyleRules({
        ':global(.fui-FluentProvider)': {
          '& .foo': { color: 'orange' },
        },
      }),
    ).toMatchInlineSnapshot(`
      .fui-FluentProvider .rmi35r5 .foo {
        color: orange;
      }
    `);
  });

  it('handles named container queries', () => {
    const result = resolveResetStyleRules({
      '@container foo (max-width: 1px)': {
        color: 'orange',
      },
    });

    expect(result).toMatchInlineSnapshot(`
      @container foo (max-width: 1px) {
        .rmph5rz {
          color: orange;
        }
      }
    `);
  });

  it('handles unnamed container queries', () => {
    const result = resolveResetStyleRules({
      '@container (max-width: 1px)': {
        color: 'orange',
      },
    });

    expect(result).toMatchInlineSnapshot(`
      @container (max-width: 1px) {
        .r1ph1abo {
          color: orange;
        }
      }
    `);
  });

  it('handles media queries', () => {
    const result = resolveResetStyleRules({
      color: 'red',
      '@media (forced-colors: active)': {
        color: 'orange',
        ':focus': {
          color: 'yellow',
        },
      },
    });

    expect(result).toMatchInlineSnapshot(`
      .rpycl1b {
        color: red;
      }
      @media (forced-colors: active) {
        .rpycl1b {
          color: orange;
        }
        .rpycl1b:focus {
          color: yellow;
        }
      }
    `);
  });

  it('handles layer queries', () => {
    const result = resolveResetStyleRules({
      '@layer utilities': {
        color: 'orange',
        ':focus': {
          color: 'yellow',
        },
      },
    });

    expect(result).toMatchInlineSnapshot(`
      @layer utilities {
        color: orange;
        :focus {
          color: yellow;
        }
      }
    `);
  });

  it('handles support queries', () => {
    const result = resolveResetStyleRules({
      '@supports (display: flex)': {
        color: 'orange',
        ':focus': {
          color: 'yellow',
        },
      },
    });

    expect(result).toMatchInlineSnapshot(`
      @supports (display: flex) {
        .rxf8lon {
          color: orange;
        }
        .rxf8lon:focus {
          color: yellow;
        }
      }
    `);
  });

  it('handles nested queries queries', () => {
    const result = resolveResetStyleRules({
      '@supports (display: flex)': {
        color: 'pink',

        '@media (forced-colors: active)': {
          color: 'orange',
        },
      },
    });

    expect(result).toMatchInlineSnapshot(`
      @supports (display: flex) {
        .rhd25ja {
          color: pink;
        }
        @media (forced-colors: active) {
          .rhd25ja {
            color: orange;
          }
        }
      }
    `);
  });

  it('handles nested selectors', () => {
    const result = resolveResetStyleRules({
      ':hover': { color: 'red' },
      '& :focus': { color: 'red' },
      '&.foo': { color: 'red' },
    });

    expect(result).toMatchInlineSnapshot(`
      .r1s1f2pl:hover {
        color: red;
      }
      .r1s1f2pl :focus {
        color: red;
      }
      .r1s1f2pl.foo {
        color: red;
      }
    `);
  });

  describe('animationName', () => {
    it('supports strings', () => {
      const result = resolveResetStyleRules({
        animationName: 'foo',
      });

      expect(result).toMatchInlineSnapshot(`
        .reh730q {
          -webkit-animation-name: foo;
          animation-name: foo;
        }
      `);
    });

    it('supports objects', () => {
      const result = resolveResetStyleRules({
        animationName: {
          from: { height: '10px' },
          to: { height: '20px' },
        },
      });

      expect(result).toMatchInlineSnapshot(`
        .r9hyr5r {
          -webkit-animation-name: r1kgwxhb;
          animation-name: r1kgwxhb;
        }
        @-webkit-keyframes r1kgwxhb {
          from {
            height: 10px;
          }
          to {
            height: 20px;
          }
        }
        @-webkit-keyframes r1kgwxhb {
          from {
            height: 10px;
          }
          to {
            height: 20px;
          }
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
          -webkit-animation-name: r1kgwxhb;
          animation-name: r1kgwxhb;
        }
      `);
    });

    it('supports arrays', () => {
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

      expect(result).toMatchInlineSnapshot(`
        .r14v303j {
          -webkit-animation-name: r1sekkel, r5j8bii;
          animation-name: r1sekkel, r5j8bii;
        }
        @-webkit-keyframes r1sekkel {
          from {
            top: 0;
          }
          to {
            top: 100px;
          }
        }
        @-webkit-keyframes r1sekkel {
          from {
            top: 0;
          }
          to {
            top: 100px;
          }
        }
        @keyframes r1sekkel {
          from {
            top: 0;
          }
          to {
            top: 100px;
          }
        }
        @-webkit-keyframes r5j8bii {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @-webkit-keyframes r5j8bii {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
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
          -webkit-animation-name: r1sekkel, r5j8bii;
          animation-name: r1sekkel, r5j8bii;
        }
      `);
    });
  });
});
