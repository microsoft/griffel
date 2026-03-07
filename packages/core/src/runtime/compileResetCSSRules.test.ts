import { describe, it, expect } from 'vitest';
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
      [
        [
          ".foo{color:red;}",
        ],
        [
          "@media (min-width: 768px){.foo{color:blue;}}",
        ],
      ]
    `);
  });
});
