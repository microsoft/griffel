import { parseCSSRules } from './parseCSSRules';
import { CSSRulesByBucket } from '@griffel/core';

function removeEmptyBuckets(cssRulesByBucket: CSSRulesByBucket) {
  return Object.fromEntries(Object.entries(cssRulesByBucket).filter(([, bucketEntries]) => bucketEntries.length > 0));
}

describe('parseCSSRules', () => {
  it('handles regular rules', () => {
    const css = `
    /** @griffel:css-start [d] **/
    .fe3e8s9 { color: red; }
    /** @griffel:css-end **/
    /** @griffel:css-start [h] **/
    .faf35ka:hover { color: red; }
    /** @griffel:css-end **/
  `;
    const { cssRulesByBucket, remainingCSS } = parseCSSRules(css);

    expect(removeEmptyBuckets(cssRulesByBucket)).toMatchInlineSnapshot(`
      Object {
        "d": Array [
          ".fe3e8s9{color:red;}",
        ],
        "h": Array [
          ".faf35ka:hover{color:red;}",
        ],
      }
    `);
    expect(remainingCSS).toBe('');
  });

  it('handles rules with meta', () => {
    const css = `
    /** @griffel:css-start [d] **/
    .fe3e8s9 { color: red; }
    /** @griffel:css-end **/
    /** @griffel:css-start [m] [{"m":"screen and (max-width: 100px)"}] **/
    @media screen and (max-width: 100px) { .fr5o61b{ color:red; } }
    /** @griffel:css-end **/
    /** @griffel:css-start [m] [{"m":"screen and (max-width: 100px)"}] **/
    @media screen and (max-width: 100px) { .f1j0ers2 { display: grid; } }
    /** @griffel:css-end **/
  `;
    const { cssRulesByBucket, remainingCSS } = parseCSSRules(css);

    expect(removeEmptyBuckets(cssRulesByBucket)).toMatchInlineSnapshot(`
      Object {
        "d": Array [
          ".fe3e8s9{color:red;}",
        ],
        "m": Array [
          Array [
            "@media screen and (max-width: 100px){.fr5o61b{color:red;}}",
            Object {
              "m": "screen and (max-width: 100px)",
            },
          ],
          Array [
            "@media screen and (max-width: 100px){.f1j0ers2{display:grid;}}",
            Object {
              "m": "screen and (max-width: 100px)",
            },
          ],
        ],
      }
    `);
    expect(remainingCSS).toBe('');
  });

  it('keeps third parties CSS', () => {
    const css = `
    /** @griffel:css-start [d] **/
    .fe3e8s9 { color: red; }
    /** @griffel:css-end **/
    .foo { color: red }
    /* some comment */
    .bar { color: green }
  `;
    const { cssRulesByBucket, remainingCSS } = parseCSSRules(css);

    expect(removeEmptyBuckets(cssRulesByBucket)).toMatchInlineSnapshot(`
      Object {
        "d": Array [
          ".fe3e8s9{color:red;}",
        ],
      }
    `);
    expect(remainingCSS).toBe('.foo{color:red;}.bar{color:green;}');
  });
});
