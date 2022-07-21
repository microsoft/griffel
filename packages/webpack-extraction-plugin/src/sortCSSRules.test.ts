import { GriffelRenderer } from '@griffel/core';
import * as prettier from 'prettier';
import { compile } from 'stylis';

import { getElementReference, getElementMetadata, sortCSSRules } from './sortCSSRules';

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

describe('getElementReference', () => {
  it.each`
    css                                                                                              | reference
    ${'.foo { color: red; }'}                                                                        | ${'.foo'}
    ${'.foo:hover { color: red; }'}                                                                  | ${'.foo:hover'}
    ${'@media (max-width: 2px) { .foo { color: blue; } }'}                                           | ${'@media (max-width: 2px)[.foo]'}
    ${'@keyframes foo { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }'}        | ${'@keyframes foo'}
    ${'@media screen and (max-width: 992px) { .a { text-align: left; } .b { text-align: right; } }'} | ${'@media screen and (max-width: 992px)[.a,.b]'}
    ${'@media (max-width: 2px) { @supports (display: grid) { .a { color: blue; } } }'}               | ${'@media (max-width: 2px)[@supports (display: grid)[.a]]'}
  `('returns "$reference" for "$css"', ({ css, reference }: { css: string; reference: string }) => {
    const element = compile(css)[0];

    expect(getElementReference(element)).toBe(reference);
  });
});

describe('getElementMetadata', () => {
  it.each`
    css                                                    | metadata
    ${'.foo { color: red; }'}                              | ${''}
    ${'.foo:hover { color: red; }'}                        | ${''}
    ${'@media (max-width: 2px) { .foo { color: blue; } }'} | ${'(max-width: 2px)'}
  `('returns "$reference" for "$css"', ({ css, metadata }: { css: string; metadata: string }) => {
    const element = compile(css)[0];

    expect(getElementMetadata(element)).toBe(metadata);
  });
});

describe('sortCSSRules', () => {
  it('removes duplicate rules', () => {
    const css = `
      .baz { color: orange; }
      .foo { color: red; }
      .baz { color: orange; }

      @media (max-width: 2px) { .foo { color: blue; } }
      @media (max-width: 2px) { .yellow { color: blue; } }
    `;

    expect(sortCSSRules(css, () => 0)).toMatchInlineSnapshot(`
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
    const css = `
      .foo:focus { color: pink; }
      .baz { color: orange; }
      .foo:hover { color: yellow; }
      .foo { color: red; }
    `;

    expect(sortCSSRules(css, () => 0)).toMatchInlineSnapshot(`
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
    const css = `
      @media (max-width: 2px) { .foo { color: blue; } }
      @media (max-width: 1px) { .foo { color: red; } }
      @media (max-width: 3px) { .foo { color: red; } }
      .foo { color: green; }
    `;

    const mediaQueryOrder = ['(max-width: 1px)', '(max-width: 2px)', '(max-width: 3px)', '(max-width: 4px)'];
    const compareMediaQueries: GriffelRenderer['compareMediaQueries'] = (a: string, b: string) =>
      mediaQueryOrder.indexOf(a) - mediaQueryOrder.indexOf(b);

    expect(sortCSSRules(css, compareMediaQueries)).toMatchInlineSnapshot(`
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

  it('removes comments from output', () => {
    const css = `
      /* This is a comment in CSS */
      .baz { color: orange; }
    `;

    expect(sortCSSRules(css, () => 0)).toMatchInlineSnapshot(`
      .baz {
        color: orange;
      }
    `);
  });
});
