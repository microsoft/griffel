import { describe, it, expect } from 'vitest';
import { compileResetCSSRules } from './compileResetCSSRules.js';

describe('compileResetCSSRules', () => {
  it('compiles CSS rules', () => {
    const body = `
      color: red;
      @media (min-width: 768px) { color: blue }
    `;

    expect(compileResetCSSRules('foo', body)).toMatchInlineSnapshot(`
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
