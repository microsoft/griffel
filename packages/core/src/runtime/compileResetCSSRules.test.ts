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

    it('hoists @layer out of @scope so @scope stays innermost', () => {
      const body = `@scope to (.boundary){:scope{@layer utilities{color:purple;}}}`;

      expect(compileResetCSSRules('foo', body)).toMatchInlineSnapshot(`
        [
          [],
          [
            "@layer utilities{@scope (.foo) to (.boundary){:scope{color:purple;}}}",
          ],
        ]
      `);
    });

    it('hoists @container out of @scope so @scope stays innermost', () => {
      const body = `@scope to (.boundary){:scope{@container (min-width: 400px){color:teal;}}}`;

      expect(compileResetCSSRules('foo', body)).toMatchInlineSnapshot(`
        [
          [],
          [
            "@container (min-width: 400px){@scope (.foo) to (.boundary){:scope{color:teal;}}}",
          ],
        ]
      `);
    });

    it('hoists multiple at-rule children of one @scope', () => {
      const body = `@scope to (.boundary){:scope{@media (min-width: 768px){color:blue;}@supports (display: grid){color:green;}}}`;

      expect(compileResetCSSRules('foo', body)).toMatchInlineSnapshot(`
        [
          [],
          [
            "@media (min-width: 768px){@scope (.foo) to (.boundary){:scope{color:blue;}}}",
            "@supports (display: grid){@scope (.foo) to (.boundary){:scope{color:green;}}}",
          ],
        ]
      `);
    });

    it('keeps inline @scope content alongside hoisted at-rule wrapper', () => {
      const body = `@scope to (.boundary){:scope{color:red;@media (min-width: 768px){color:blue;}}}`;

      expect(compileResetCSSRules('foo', body)).toMatchInlineSnapshot(`
        [
          [
            "@scope (.foo) to (.boundary){:scope{color:red;}}",
          ],
          [
            "@media (min-width: 768px){@scope (.foo) to (.boundary){:scope{color:blue;}}}",
          ],
        ]
      `);
    });

    it('passes through @scope already nested inside an at-rule', () => {
      const body = `@media (min-width: 768px){@scope to (.boundary){:scope{color:blue;}}}`;

      expect(compileResetCSSRules('foo', body)).toMatchInlineSnapshot(`
        [
          [],
          [
            "@media (min-width: 768px){@scope (.foo) to (.boundary){:scope{color:blue;}}}",
          ],
        ]
      `);
    });

    it('hoists @media and @supports out of @scope (nested at-rules)', () => {
      const body = `@scope to (.boundary){:scope{@media (min-width: 768px){color:red;@supports (display: grid){color:blue;}}}}`;

      expect(compileResetCSSRules('foo', body)).toMatchInlineSnapshot(`
        [
          [],
          [
            "@media (min-width: 768px){@scope (.foo) to (.boundary){:scope{color:red;}}@supports (display: grid){@scope (.foo) to (.boundary){:scope{color:blue;}}}}",
          ],
        ]
      `);
    });

    it('processes multiple sibling @scope rules independently', () => {
      const body = `@scope to (.a){:scope{color:red;}}@scope to (.b){:scope{color:blue;}}`;

      expect(compileResetCSSRules('foo', body)).toMatchInlineSnapshot(`
        [
          [
            "@scope (.foo) to (.a){:scope{color:red;}}",
            "@scope (.foo) to (.b){:scope{color:blue;}}",
          ],
          [],
        ]
      `);
    });
  });
});
