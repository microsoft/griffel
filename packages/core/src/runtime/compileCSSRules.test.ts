import { compileCSSRules } from './compileCSSRules';

describe('compileCSSRules', () => {
  it('compiles CSS rules', () => {
    const cssRules = `
      .foo {
        color: red;
        @media (min-width: 768px) { color: blue }
      }
    `;

    expect(compileCSSRules(cssRules, false)).toMatchInlineSnapshot(`
      Array [
        ".foo{color:red;}",
        "@media (min-width: 768px){.foo{color:blue;}}",
      ]
    `);
  });

  it('sorts children in at rules', () => {
    const cssRules = `
      .qux { @media (min-width: 2px) { color: orange } }
      .foo { @media (min-width: 2px) { color: orange } }
      .baz { @media (min-width: 2px) { color: orange } }
    `;

    expect(compileCSSRules(cssRules, true)).toMatchInlineSnapshot(`
      Array [
        "@media (min-width: 2px){.qux{color:orange;}}",
        "@media (min-width: 2px){.foo{color:orange;}}",
        "@media (min-width: 2px){.baz{color:orange;}}",
      ]
    `);
  });
});
