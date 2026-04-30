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

  describe('@scope', () => {
    it('inserts the class as the @scope root', () => {
      const body = `@scope to (.boundary){:scope{color:red;}}`;

      expect(compileResetCSSRules('foo', body)).toMatchInlineSnapshot(`
        [
          [
            "@scope (.foo) to (.boundary){:scope{color:red;}}",
          ],
          [],
        ]
      `);
    });

    it('strips the class prefix from @scope descendants', () => {
      const body = `@scope to (.boundary){:scope{ p{color:red;}}}`;

      expect(compileResetCSSRules('foo', body)).toMatchInlineSnapshot(`
        [
          [
            "@scope (.foo) to (.boundary){:scope p{color:red;}}",
          ],
          [],
        ]
      `);
    });

    it('hoists @media out of @scope so @scope stays innermost', () => {
      const body = `@scope to (.boundary){:scope{@media (min-width: 768px){color:blue;}}}`;

      expect(compileResetCSSRules('foo', body)).toMatchInlineSnapshot(`
        [
          [],
          [
            "@media (min-width: 768px){@scope (.foo) to (.boundary){:scope{color:blue;}}}",
          ],
        ]
      `);
    });

    it('hoists @supports out of @scope so @scope stays innermost', () => {
      const body = `@scope to (.boundary){:scope{@supports (display: grid){color:green;}}}`;

      expect(compileResetCSSRules('foo', body)).toMatchInlineSnapshot(`
        [
          [],
          [
            "@supports (display: grid){@scope (.foo) to (.boundary){:scope{color:green;}}}",
          ],
        ]
      `);
    });

    it('keeps non-scope content alongside @scope rules', () => {
      const body = `color:black;@scope to (.boundary){:scope{color:red;}}`;

      expect(compileResetCSSRules('foo', body)).toMatchInlineSnapshot(`
        [
          [
            ".foo{color:black;}",
            "@scope (.foo) to (.boundary){:scope{color:red;}}",
          ],
          [],
        ]
      `);
    });
  });
});
