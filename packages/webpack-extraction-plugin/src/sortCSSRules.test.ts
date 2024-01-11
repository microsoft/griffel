import type { CSSRulesByBucket, GriffelRenderer } from '@griffel/core';
import * as prettier from 'prettier';

import { sortCSSRules } from './sortCSSRules';

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
      d: ['.baz { color: orange; }'],
      f: ['.foo:focus { color: pink; }'],
    };
    const setB: CSSRulesByBucket = {
      d: ['.foo { color: red; }'],
      h: ['.foo:hover { color: yellow; }'],
    };

    expect(sortCSSRules([setA, setB], () => 0)).toMatchInlineSnapshot(`
      .baz {
        color: orange;
      }
      .foo {
        color: red;
      }
      .foo:focus {
        color: pink;
      }
      .foo:hover {
        color: yellow;
      }
    `);
  });

  it('sorts media queries', () => {
    const setA: CSSRulesByBucket = {
      m: [
        ['@media (max-width: 2px) { .foo { color: blue; } }', { m: '(max-width: 2px)' }],
        ['@media (max-width: 3px) { .foo { color: red; } }', { m: '(max-width: 3px)' }],
      ],
    };
    const setB: CSSRulesByBucket = {
      d: ['.foo { color: green; }'],
      m: [['@media (max-width: 1px) { .foo { color: red; } }', { m: '(max-width: 1px)' }]],
    };

    const mediaQueryOrder = ['(max-width: 1px)', '(max-width: 2px)', '(max-width: 3px)', '(max-width: 4px)'];
    const compareMediaQueries: GriffelRenderer['compareMediaQueries'] = (a: string, b: string) =>
      mediaQueryOrder.indexOf(a) - mediaQueryOrder.indexOf(b);

    expect(sortCSSRules([setA, setB], compareMediaQueries)).toMatchInlineSnapshot(`
      .foo {
        color: green;
      }
      @media (max-width: 1px) {
        .foo {
          color: red;
        }
      }
      @media (max-width: 2px) {
        .foo {
          color: blue;
        }
      }
      @media (max-width: 3px) {
        .foo {
          color: red;
        }
      }
    `);
  });
});
