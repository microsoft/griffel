import type { CSSRulesByBucket } from '@griffel/core';

import { generateCSSRules } from './generateCSSRules';
import { parseCSSRules } from './parseCSSRules';

function removeEmptyBuckets(cssRulesByBucket: CSSRulesByBucket) {
  return Object.fromEntries(Object.entries(cssRulesByBucket).filter(([, bucketEntries]) => bucketEntries.length > 0));
}

describe('parseCSSRules', () => {
  it('handles regular rules', () => {
    const cssRulesByBucket: CSSRulesByBucket = {
      d: ['.fe3e8s9{color:red;}'],
      h: ['.faf35ka:hover{color:red;}'],
    };
    const css = generateCSSRules(cssRulesByBucket);
    const result = parseCSSRules(css);

    expect(removeEmptyBuckets(result.cssRulesByBucket)).toEqual(cssRulesByBucket);
    expect(result.remainingCSS).toBe('');
  });

  it('handles rules with meta', () => {
    const cssRulesByBucket: CSSRulesByBucket = {
      d: ['.fe3e8s9{color:red;}', ['.f65sxns{background:green;}', { p: -2 }]],
      m: [
        ['@media screen and (max-width: 100px){.fr5o61b{color:red;}}', { m: 'screen and (max-width: 100px)' }],
        ['@media screen and (max-width: 100px){.f1j0ers2{display:grid;}}', { m: 'screen and (max-width: 100px)' }],
        ['@media screen and (max-width: 100px){.fr5o61c{padding:0;}}', { m: 'screen and (max-width: 100px)', p: -1 }],
      ],
    };
    const css = generateCSSRules(cssRulesByBucket);
    const result = parseCSSRules(css);

    expect(removeEmptyBuckets(result.cssRulesByBucket)).toMatchInlineSnapshot(`
      Object {
        "d": Array [
          ".fe3e8s9{color:red;}",
          Array [
            ".f65sxns{background:green;}",
            Object {
              "p": -2,
            },
          ],
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
          Array [
            "@media screen and (max-width: 100px){.fr5o61c{padding:0;}}",
            Object {
              "m": "screen and (max-width: 100px)",
              "p": -1,
            },
          ],
        ],
      }
    `);
    expect(result.remainingCSS).toBe('');
  });

  it('keeps third parties CSS', () => {
    const cssRulesByBucket: CSSRulesByBucket = {
      d: ['.fe3e8s9{color:red;}'],
    };
    const css = generateCSSRules(cssRulesByBucket);
    const thirdPartyCSS = `
    .foo { color: red }
    /* some comment */
    .bar { color: green }
  `;
    const result = parseCSSRules(css + thirdPartyCSS);

    expect(removeEmptyBuckets(result.cssRulesByBucket)).toMatchInlineSnapshot(`
      Object {
        "d": Array [
          ".fe3e8s9{color:red;}",
        ],
      }
    `);
    expect(result.remainingCSS).toBe('.foo{color:red;}.bar{color:green;}');
  });
});
