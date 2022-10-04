import { resolveResetStyleRules } from './resolveResetStyleRules';

describe('resolveResetStyleRules', () => {
  it('handles base rules', () => {
    const result = resolveResetStyleRules({
      color: 'red',
      overflowX: 'hidden',
    });

    expect(result).toMatchInlineSnapshot(`
      Array [
        "r11y0rml",
        null,
        Array [
          ".r11y0rml{color:red;overflow-x:hidden;}",
        ],
      ]
    `);
  });

  it('handles RTL', () => {
    const result = resolveResetStyleRules({ marginLeft: '15px' });

    expect(result).toMatchInlineSnapshot(`
      Array [
        "rovwgyn",
        "rj5b9iu",
        Array [
          ".rovwgyn{margin-left:15px;}",
          ".rj5b9iu{margin-right:15px;}",
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
        "rj1urkn",
        null,
        Array [
          ".rj1urkn{color:red;color:blue;}",
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
        "rzlpwqs",
        null,
        Array [
          ".rzlpwqs{color:red;}",
          "body .rzlpwqs{color:magenta;}",
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
        "r1i1zh9k",
        null,
        Array [
          "body .r1i1zh9k{color:magenta;}",
          "body .r1i1zh9k:focus{color:pink;}",
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
        "rmi35r5",
        null,
        Array [
          ".fui-FluentProvider .rmi35r5 .foo{color:orange;}",
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
        "rpycl1b",
        null,
        Array [
          ".rpycl1b{color:red;}",
          "@media (forced-colors: active){.rpycl1b{color:orange;}.rpycl1b:focus{color:yellow;}}",
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
        "rvhnavh",
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
        "rxf8lon",
        null,
        Array [
          "@supports (display: flex){.rxf8lon{color:orange;}.rxf8lon:focus{color:yellow;}}",
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
        "rhd25ja",
        null,
        Array [
          "@supports (display: flex){.rhd25ja{color:pink;}@media (forced-colors: active){.rhd25ja{color:orange;}}}",
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
        "r1s1f2pl",
        null,
        Array [
          ".r1s1f2pl:hover{color:red;}",
          ".r1s1f2pl :focus{color:red;}",
          ".r1s1f2pl.foo{color:red;}",
        ],
      ]
    `);
  });
});
