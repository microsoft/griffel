import { resolveResetStyleRules } from './resolveResetStyleRules';

describe('resolveResetStyleRules', () => {
  it('handles base rules', () => {
    const result = resolveResetStyleRules({
      color: 'red',
      overflowX: 'hidden',
    });

    expect(result).toMatchInlineSnapshot(`
      Array [
        "rf11y0rml",
        null,
        Array [
          ".rf11y0rml{color:red;overflow-x:hidden;}",
        ],
      ]
    `);
  });

  it('handles RTL', () => {
    const result = resolveResetStyleRules({ marginLeft: '15px' });

    expect(result).toMatchInlineSnapshot(`
      Array [
        "rfovwgyn",
        "rfj5b9iu",
        Array [
          ".rfovwgyn{margin-left:15px;}",
          ".rfj5b9iu{margin-right:15px;}",
        ],
      ]
    `);
  });

  it('handles fallback values', () => {
    const result = resolveResetStyleRules({
      color: ['red', 'blue'],
    });

    expect(result).toMatchInlineSnapshot(`
      Array [
        "rfj1urkn",
        null,
        Array [
          ".rfj1urkn{color:red;color:blue;}",
        ],
      ]
    `);
  });

  it('handles :global() selector', () => {
    expect(
      resolveResetStyleRules({
        color: 'red',
        ':global(body)': { color: 'magenta' },
      }),
    ).toMatchInlineSnapshot(`
      Array [
        "rfzlpwqs",
        null,
        Array [
          ".rfzlpwqs{color:red;}",
          "body .rfzlpwqs{color:magenta;}",
        ],
      ]
    `);

    expect(
      resolveResetStyleRules({
        ':global(body)': {
          color: 'magenta',
          ':focus': { color: 'pink' },
        },
      }),
    ).toMatchInlineSnapshot(`
      Array [
        "rf1i1zh9k",
        null,
        Array [
          "body .rf1i1zh9k{color:magenta;}",
          "body .rf1i1zh9k:focus{color:pink;}",
        ],
      ]
    `);

    expect(
      resolveResetStyleRules({
        ':global(.fui-FluentProvider)': {
          '& .foo': { color: 'orange' },
        },
      }),
    ).toMatchInlineSnapshot(`
      Array [
        "rfmi35r5",
        null,
        Array [
          ".fui-FluentProvider .rfmi35r5 .foo{color:orange;}",
        ],
      ]
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
      Array [
        "rfpycl1b",
        null,
        Array [
          ".rfpycl1b{color:red;}",
          "@media (forced-colors: active){.rfpycl1b{color:orange;}.rfpycl1b:focus{color:yellow;}}",
        ],
      ]
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
      Array [
        "rfvhnavh",
        null,
        Array [
          "@layer utilities{color:orange;:focus{color:yellow;}}",
        ],
      ]
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
      Array [
        "rfxf8lon",
        null,
        Array [
          "@supports (display: flex){.rfxf8lon{color:orange;}.rfxf8lon:focus{color:yellow;}}",
        ],
      ]
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
      Array [
        "rfhd25ja",
        null,
        Array [
          "@supports (display: flex){.rfhd25ja{color:pink;}@media (forced-colors: active){.rfhd25ja{color:orange;}}}",
        ],
      ]
    `);
  });

  it('handles nested selectors', () => {
    const result = resolveResetStyleRules({
      ':hover': { color: 'red' },
      '& :focus': { color: 'red' },
      '&.foo': { color: 'red' },
    });

    expect(result).toMatchInlineSnapshot(`
      Array [
        "rf1s1f2pl",
        null,
        Array [
          ".rf1s1f2pl:hover{color:red;}",
          ".rf1s1f2pl :focus{color:red;}",
          ".rf1s1f2pl.foo{color:red;}",
        ],
      ]
    `);
  });
});
