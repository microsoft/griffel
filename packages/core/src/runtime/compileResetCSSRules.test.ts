import { compileResetCSSRules } from './compileResetCSSRules';

describe('compileCSSRules', () => {
  it('compiles CSS rules', () => {
    const cssRules = `
      .foo {
        color: red;
        @media (min-width: 768px) { color: blue }
      }
    `;

    expect(compileResetCSSRules(cssRules)).toMatchInlineSnapshot(`
      Array [
        Array [
          ".foo{color:red;}",
        ],
        Array [
          "@media (min-width: 768px){.foo{color:blue;}}",
        ],
      ]
    `);
  });
});
