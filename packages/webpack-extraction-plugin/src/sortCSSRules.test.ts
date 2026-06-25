import type { CSSRulesByBucket, GriffelRenderer } from '@griffel/core';
import * as prettier from 'prettier';
import { describe, expect, it } from 'vitest';

import { getUniqueRulesFromSets, sortCSSRules } from './sortCSSRules';

async function formatCss(value: string) {
  return (await prettier.format(value, { parser: 'css' })).trim();
}

describe('getUniqueRulesFromSets', () => {
  it('removes duplicate rules', () => {
    const setA: CSSRulesByBucket = {
      d: ['.baz { color: orange; }', '.foo { color: red; }'],
      m: [['@media (max-width: 2px) { .foo { color: blue; } }', { m: '(max-width: 2px)' }]],
    };
    const setB: CSSRulesByBucket = {
      d: ['.baz { color: orange; }'],
      m: [['@media (max-width: 2px) { .yellow { color: blue; } }', { m: '(max-width: 2px)' }]],
    };

    expect(getUniqueRulesFromSets([setA, setB])).toEqual([
      { cssRule: '.baz { color: orange; }', priority: 0, media: '', container: '', styleBucketName: 'd' },
      { cssRule: '.foo { color: red; }', priority: 0, media: '', container: '', styleBucketName: 'd' },
      {
        cssRule: '@media (max-width: 2px) { .foo { color: blue; } }',
        priority: 0,
        media: '(max-width: 2px)',
        container: '',
        styleBucketName: 'm',
      },
      {
        cssRule: '@media (max-width: 2px) { .yellow { color: blue; } }',
        priority: 0,
        media: '(max-width: 2px)',
        container: '',
        styleBucketName: 'm',
      },
    ]);
  });
});

describe('sortCSSRules', () => {
  it('removes duplicate rules', async () => {
    const setA: CSSRulesByBucket = {
      d: ['.baz { color: orange; }', '.foo { color: red; }'],
      m: [['@media (max-width: 2px) { .foo { color: blue; } }', { m: '(max-width: 2px)' }]],
    };
    const setB: CSSRulesByBucket = {
      d: ['.baz { color: orange; }'],
      m: [['@media (max-width: 2px) { .yellow { color: blue; } }', { m: '(max-width: 2px)' }]],
    };

    expect(await formatCss(sortCSSRules([setA, setB], () => 0))).toMatchInlineSnapshot(`
      ".baz {
        color: orange;
      }
      .foo {
        color: red;
      }
      @media (max-width: 2px) {
        .foo {
          color: blue;
        }
      }
      @media (max-width: 2px) {
        .yellow {
          color: blue;
        }
      }"
    `);
  });

  it('sorts rules by buckets order', async () => {
    const setA: CSSRulesByBucket = {
      d: ['.default { color: orange; }'],
      f: ['.focus:focus { color: pink; }'],
    };
    const setB: CSSRulesByBucket = {
      d: ['.default { color: red; }'],
      h: ['.hover:hover { color: yellow; }'],
    };

    expect(await formatCss(sortCSSRules([setA, setB], () => 0))).toMatchInlineSnapshot(`
      ".default {
        color: orange;
      }
      .default {
        color: red;
      }
      .focus:focus {
        color: pink;
      }
      .hover:hover {
        color: yellow;
      }"
    `);
  });

  it('sorts rules by buckets & priority', async () => {
    const setA: CSSRulesByBucket = {
      d: ['.prio0 { color: orange; }', ['.prio-1 { margin: 0; }', { p: -1 }]],
      f: ['.prio0:focus { color: pink; }'],
      h: [['.prio-1:hover { padding: 0; }', { p: -1 }]],
    };
    const setB: CSSRulesByBucket = {
      r: ['.reset { margin: 0; padding: 0 }'],
      d: [
        ['.prio-3 { border: 3px solid red; }', { p: -3 }],
        ['.prio-2 { background: green; }', { p: -2 }],
      ],
      f: [['.prio-1:focus { padding: 0; }', { p: -2 }]],
    };

    expect(await formatCss(sortCSSRules([setA, setB], () => 0))).toMatchInlineSnapshot(`
      ".reset {
        margin: 0;
        padding: 0;
      }
      .prio-3 {
        border: 3px solid red;
      }
      .prio-2 {
        background: green;
      }
      .prio-1 {
        margin: 0;
      }
      .prio0 {
        color: orange;
      }
      .prio-1:focus {
        padding: 0;
      }
      .prio0:focus {
        color: pink;
      }
      .prio-1:hover {
        padding: 0;
      }"
    `);
  });

  describe('container queries', () => {
    it('sorts container queries by the supplied comparator regardless of source order', async () => {
      // Source order is reversed (720px before 480px) and a larger 1024px breakpoint is mixed in. The
      // emitted order must follow the comparator, not the source or lexicographic order.
      const setA: CSSRulesByBucket = {
        c: [
          ['@container c (min-width: 720px) { .cw720 { margin-left: 40px; } }', { c: 'c (min-width: 720px)' }],
          ['@container c (min-width: 480px) { .cw480 { margin-left: 24px; } }', { c: 'c (min-width: 480px)' }],
        ],
      };
      const setB: CSSRulesByBucket = {
        d: ['.default { margin-left: 0; }'],
        c: [['@container c (min-width: 1024px) { .cw1024 { margin-left: 56px; } }', { c: 'c (min-width: 1024px)' }]],
      };

      const containerQueryOrder = ['c (min-width: 480px)', 'c (min-width: 720px)', 'c (min-width: 1024px)'];
      const compareContainerQueries: GriffelRenderer['compareContainerQueries'] = (a, b) =>
        containerQueryOrder.indexOf(a) - containerQueryOrder.indexOf(b);

      expect(await formatCss(sortCSSRules([setA, setB], () => 0, compareContainerQueries))).toMatchInlineSnapshot(`
        ".default {
          margin-left: 0;
        }
        @container c (min-width: 480px) {
          .cw480 {
            margin-left: 24px;
          }
        }
        @container c (min-width: 720px) {
          .cw720 {
            margin-left: 40px;
          }
        }
        @container c (min-width: 1024px) {
          .cw1024 {
            margin-left: 56px;
          }
        }"
      `);
    });

    it('orders container and media rules within their own buckets', async () => {
      const set: CSSRulesByBucket = {
        m: [
          ['@media (min-width: 720px) { .mw720 { color: blue; } }', { m: '(min-width: 720px)' }],
          ['@media (min-width: 480px) { .mw480 { color: red; } }', { m: '(min-width: 480px)' }],
        ],
        c: [
          ['@container (min-width: 720px) { .cw720 { color: blue; } }', { c: '(min-width: 720px)' }],
          ['@container (min-width: 480px) { .cw480 { color: red; } }', { c: '(min-width: 480px)' }],
        ],
      };

      const mediaQueryOrder = ['(min-width: 480px)', '(min-width: 720px)'];
      const compareMediaQueries: GriffelRenderer['compareMediaQueries'] = (a, b) =>
        mediaQueryOrder.indexOf(a) - mediaQueryOrder.indexOf(b);

      // "@media" sorts before "@container" (bucket order), each ordered within its own bucket. Container
      // queries default to the same comparator as media queries when none is supplied.
      expect(await formatCss(sortCSSRules([set], compareMediaQueries))).toMatchInlineSnapshot(`
        "@media (min-width: 480px) {
          .mw480 {
            color: red;
          }
        }
        @media (min-width: 720px) {
          .mw720 {
            color: blue;
          }
        }
        @container (min-width: 480px) {
          .cw480 {
            color: red;
          }
        }
        @container (min-width: 720px) {
          .cw720 {
            color: blue;
          }
        }"
      `);
    });

    it('orders "max-width" container queries by the supplied comparator', async () => {
      const set: CSSRulesByBucket = {
        c: [
          ['@container (max-width: 480px) { .cw480 { color: red; } }', { c: '(max-width: 480px)' }],
          ['@container (max-width: 720px) { .cw720 { color: blue; } }', { c: '(max-width: 720px)' }],
        ],
      };

      const containerQueryOrder = ['(max-width: 720px)', '(max-width: 480px)'];
      const compareContainerQueries: GriffelRenderer['compareContainerQueries'] = (a, b) =>
        containerQueryOrder.indexOf(a) - containerQueryOrder.indexOf(b);

      expect(await formatCss(sortCSSRules([set], () => 0, compareContainerQueries))).toMatchInlineSnapshot(`
        "@container (max-width: 720px) {
          .cw720 {
            color: blue;
          }
        }
        @container (max-width: 480px) {
          .cw480 {
            color: red;
          }
        }"
      `);
    });
  });

  describe('media queries', () => {
    it('sorts media queries', async () => {
      const setA: CSSRulesByBucket = {
        m: [
          ['@media (max-width: 2px) { .mw2 { color: blue; } }', { m: '(max-width: 2px)' }],
          ['@media (max-width: 3px) { .mw3 { color: red; } }', { m: '(max-width: 3px)' }],
        ],
      };
      const setB: CSSRulesByBucket = {
        d: ['.default { color: green; }'],
        m: [['@media (max-width: 1px) { .mw1 { color: red; } }', { m: '(max-width: 1px)' }]],
      };

      const mediaQueryOrder = ['(max-width: 1px)', '(max-width: 2px)', '(max-width: 3px)', '(max-width: 4px)'];
      const compareMediaQueries: GriffelRenderer['compareMediaQueries'] = (a, b) =>
        mediaQueryOrder.indexOf(a) - mediaQueryOrder.indexOf(b);

      expect(await formatCss(sortCSSRules([setA, setB], compareMediaQueries))).toMatchInlineSnapshot(`
        ".default {
          color: green;
        }
        @media (max-width: 1px) {
          .mw1 {
            color: red;
          }
        }
        @media (max-width: 2px) {
          .mw2 {
            color: blue;
          }
        }
        @media (max-width: 3px) {
          .mw3 {
            color: red;
          }
        }"
      `);
    });

    it('handles priority', async () => {
      const setA: CSSRulesByBucket = {
        m: [
          ['@media (max-width: 1px) { .mw1-prio0 { display: flex; } }', { m: '(max-width: 1px)' }],
          ['@media (max-width: 2px) { .mw2-prio0 { display: grid; } }', { m: '(max-width: 2px)' }],
          ['@media (max-width: 2px) { .mw2-prio-1 { padding: 0; } }', { m: '(max-width: 2px)', p: -1 }],
        ],
      };
      const setB: CSSRulesByBucket = {
        m: [
          ['@media (max-width: 1px) { .mw1-prio-1 { padding: 5px; } }', { m: '(max-width: 1px)', p: -1 }],
          ['@media (max-width: 3px) { .mw3-prio0 { display: table; } }', { m: '(max-width: 3px)' }],
          ['@media (max-width: 3px) { .mw3-prio-1 { padding: 5px; } }', { m: '(max-width: 3px)', p: -1 }],
        ],
      };
      const setC: CSSRulesByBucket = {
        m: [
          ['@media (max-width: 1px) { .mw1-prio-1 { margin: 5px; } }', { m: '(max-width: 1px)', p: -1 }],
          ['@media (max-width: 1px) { .mw1-prio-3 { border: 5px; } }', { m: '(max-width: 1px)', p: -3 }],
        ],
      };

      const mediaQueryOrder = ['(max-width: 1px)', '(max-width: 2px)', '(max-width: 3px)'];
      const compareMediaQueries: GriffelRenderer['compareMediaQueries'] = (a, b) =>
        mediaQueryOrder.indexOf(a) - mediaQueryOrder.indexOf(b);

      expect(await formatCss(sortCSSRules([setA, setB, setC], compareMediaQueries))).toMatchInlineSnapshot(`
        "@media (max-width: 1px) {
          .mw1-prio-3 {
            border: 5px;
          }
        }
        @media (max-width: 1px) {
          .mw1-prio-1 {
            padding: 5px;
          }
        }
        @media (max-width: 1px) {
          .mw1-prio-1 {
            margin: 5px;
          }
        }
        @media (max-width: 1px) {
          .mw1-prio0 {
            display: flex;
          }
        }
        @media (max-width: 2px) {
          .mw2-prio-1 {
            padding: 0;
          }
        }
        @media (max-width: 2px) {
          .mw2-prio0 {
            display: grid;
          }
        }
        @media (max-width: 3px) {
          .mw3-prio-1 {
            padding: 5px;
          }
        }
        @media (max-width: 3px) {
          .mw3-prio0 {
            display: table;
          }
        }"
      `);
    });
  });
});
