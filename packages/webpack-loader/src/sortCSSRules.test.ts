import type { CSSRulesByBucket, GriffelRenderer } from '@griffel/core';
import * as prettier from 'prettier';

import { getUniqueRulesFromSets, sortCSSRules } from './sortCSSRules';

export const cssSerializer: jest.SnapshotSerializerPlugin = {
  test(value) {
    return typeof value === 'string';
  },
  print(value) {
    /**
     * test function makes sure that value is the guarded type
     */
    const _value = value as string;

    return prettier.format(_value, { parser: 'css' }).trim();
  },
};

expect.addSnapshotSerializer(cssSerializer);

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
      { cssRule: '.baz { color: orange; }', priority: 0, media: '', styleBucketName: 'd' },
      { cssRule: '.foo { color: red; }', priority: 0, media: '', styleBucketName: 'd' },
      {
        cssRule: '@media (max-width: 2px) { .foo { color: blue; } }',
        priority: 0,
        media: '(max-width: 2px)',
        styleBucketName: 'm',
      },
      {
        cssRule: '@media (max-width: 2px) { .yellow { color: blue; } }',
        priority: 0,
        media: '(max-width: 2px)',
        styleBucketName: 'm',
      },
    ]);
  });
});

describe('sortCSSRules', () => {
  it('removes duplicate rules', () => {
    const setA: CSSRulesByBucket = {
      d: ['.baz { color: orange; }', '.foo { color: red; }'],
      m: [['@media (max-width: 2px) { .foo { color: blue; } }', { m: '(max-width: 2px)' }]],
    };
    const setB: CSSRulesByBucket = {
      d: ['.baz { color: orange; }'],
      m: [['@media (max-width: 2px) { .yellow { color: blue; } }', { m: '(max-width: 2px)' }]],
    };

    expect(sortCSSRules([setA, setB], () => 0)).toMatchInlineSnapshot(`
      .baz {
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
      }
    `);
  });

  it('sorts rules by buckets order', () => {
    const setA: CSSRulesByBucket = {
      d: ['.default { color: orange; }'],
      f: ['.focus:focus { color: pink; }'],
    };
    const setB: CSSRulesByBucket = {
      d: ['.default { color: red; }'],
      h: ['.hover:hover { color: yellow; }'],
    };

    expect(sortCSSRules([setA, setB], () => 0)).toMatchInlineSnapshot(`
      .default {
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
      }
    `);
  });

  it('sorts rules by buckets & priority', () => {
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

    expect(sortCSSRules([setA, setB], () => 0)).toMatchInlineSnapshot(`
      .reset {
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
      }
    `);
  });

  describe('media queries', () => {
    it('sorts media queries', () => {
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

      expect(sortCSSRules([setA, setB], compareMediaQueries)).toMatchInlineSnapshot(`
        .default {
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
        }
      `);
    });

    it('handles priority', () => {
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

      expect(sortCSSRules([setA, setB, setC], compareMediaQueries)).toMatchInlineSnapshot(`
        @media (max-width: 1px) {
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
        }
      `);
    });
  });
});
