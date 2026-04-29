import { describe, it, expect } from 'vitest';
import { compileAtomicCSSRule, normalizePseudoSelector } from './compileAtomicCSSRule.js';
import type { CompileAtomicCSSOptions } from './compileAtomicCSSRule.js';
import type { AtRules } from './utils/types.js';

const defaultOptions: Pick<CompileAtomicCSSOptions, 'rtlClassName' | 'className' | 'selectors'> = {
  className: 'foo',
  rtlClassName: 'rtl-foo',
  selectors: [],
};
const defaultAtRules: AtRules = {
  container: '',
  layer: '',
  media: '',
  supports: '',
  scope: '',
};

describe('compileAtomicCSSRule', () => {
  it.each([
    ['transform', 'none'],
    ['flex-grow', '1'],
    ['flex-shrink', '1'],
    ['flex-basis', 'auto'],
    ['flex-direction', 'column'],
    ['align-self', 'center'],
    ['align-content', 'center'],
    ['align-items', 'center'],
    ['order', '1'],
    ['justify-content', 'center'],
    ['display', 'flex'],
    ['display', 'inline-flex'],
    ['display', 'grid'],
    ['display', 'inline-grid'],
    ['transition', 'margin-right 4s'],
    ['writing-mode', 'vertical-lr'],
    ['columns', '2'],
    ['text-size-adjust', 'none'],
    ['text-decoration', 'none'],
    ['filter', 'blur(5px)'],
    ['position', 'sticky'],
    ['clip-path', 'circle(40%)'],
    ['width', 'fit-content'],
    ['width', 'min-block-size'],
    ['background-clip', 'content-box'],
    ['animation', '3s linear 1s slidein;'],
    ['animation-delay', '3s'],
    ['animation-direction', 'normal'],
    ['animation-duration', '3s'],
    ['animation-fill-mode', 'both'],
    ['animation-iteration-count', '10'],
    ['animation-name', 'foo'],
    ['animation-play-state', 'running'],
    ['animation-timing-function', 'linear'],
    ['scroll-snap-type', 'none'],
    ['scroll-margin', '0'],
  ])('does not prefix %s:%s', (property, value) => {
    expect(
      compileAtomicCSSRule(
        {
          ...defaultOptions,
          property,
          value,
        },
        defaultAtRules,
      ),
    ).toMatchSnapshot();
  });

  it('handles pseudo', () => {
    expect(
      compileAtomicCSSRule(
        {
          ...defaultOptions,
          selectors: [':hover'],
          property: 'color',
          value: 'red',
        },
        defaultAtRules,
      ),
    ).toMatchInlineSnapshot(`
      [
        ".foo:hover{color:red;}",
      ]
    `);
    expect(
      compileAtomicCSSRule(
        {
          ...defaultOptions,
          selectors: [':focus:hover'],
          property: 'color',
          value: 'red',
        },
        defaultAtRules,
      ),
    ).toMatchInlineSnapshot(`
      [
        ".foo:focus:hover{color:red;}",
      ]
    `);
  });

  it('handles array of values', () => {
    expect(
      compileAtomicCSSRule(
        {
          ...defaultOptions,
          property: 'color',
          value: ['red', 'blue'],
        },
        defaultAtRules,
      ),
    ).toMatchInlineSnapshot(`
      [
        ".foo{color:red;color:blue;}",
      ]
    `);
  });

  it('handles at-rules', () => {
    expect(
      compileAtomicCSSRule(
        {
          ...defaultOptions,
          property: 'color',
          value: 'red',
        },
        { ...defaultAtRules, media: '(max-width: 100px)' },
      ),
    ).toMatchInlineSnapshot(`
      [
        "@media (max-width: 100px){.foo{color:red;}}",
      ]
    `);
    expect(
      compileAtomicCSSRule(
        {
          ...defaultOptions,
          property: 'color',
          value: 'red',
        },
        { ...defaultAtRules, supports: '(display: table-cell)' },
      ),
    ).toMatchInlineSnapshot(`
      [
        "@supports (display: table-cell){.foo{color:red;}}",
      ]
    `);
  });

  it('handles rtl properties', () => {
    expect(
      compileAtomicCSSRule(
        {
          ...defaultOptions,

          property: 'paddingLeft',
          value: '10px',

          rtlProperty: 'paddingRight',
          rtlValue: '10px',
        },
        defaultAtRules,
      ),
    ).toMatchInlineSnapshot(`
      [
        ".foo{padding-left:10px;}",
        ".rtl-foo{padding-right:10px;}",
      ]
    `);
  });

  it('handles rtl properties with pseudo selectors', () => {
    expect(
      compileAtomicCSSRule(
        {
          ...defaultOptions,
          selectors: [':before'],

          property: 'paddingLeft',
          value: '10px',

          rtlProperty: 'paddingRight',
          rtlValue: '10px',
        },
        defaultAtRules,
      ),
    ).toMatchInlineSnapshot(`
      [
        ".foo:before{padding-left:10px;}",
        ".rtl-foo:before{padding-right:10px;}",
      ]
    `);
  });

  it('handles rtl properties with fallback values', () => {
    expect(
      compileAtomicCSSRule(
        {
          ...defaultOptions,
          property: 'paddingLeft',
          value: [0, '10px'],
          rtlProperty: 'paddingRight',
          rtlValue: [0, '10px'],
        },
        defaultAtRules,
      ),
    ).toMatchInlineSnapshot(`
      [
        ".foo{padding-left:0;padding-left:10px;}",
        ".rtl-foo{padding-right:0;padding-right:10px;}",
      ]
    `);
  });

  describe('global', () => {
    it('compiles global rules', () => {
      expect(
        compileAtomicCSSRule(
          {
            ...defaultOptions,
            selectors: [':global(body)'],
            property: 'color',
            value: 'red',
          },
          defaultAtRules,
        ),
      ).toMatchInlineSnapshot(`
        [
          "body .foo{color:red;}",
        ]
      `);
      expect(
        compileAtomicCSSRule(
          {
            ...defaultOptions,
            selectors: [':global(.fui-FluentProvider)', '& .focus:hover'],
            property: 'color',
            value: 'red',
          },
          defaultAtRules,
        ),
      ).toMatchInlineSnapshot(`
        [
          ".fui-FluentProvider .foo .focus:hover{color:red;}",
        ]
      `);
    });

    it('compiles global rules with RTL', () => {
      expect(
        compileAtomicCSSRule(
          {
            ...defaultOptions,
            selectors: [':global(body)'],
            property: 'paddingLeft',
            value: '10px',

            rtlProperty: 'paddingRight',
            rtlValue: '10px',
          },
          defaultAtRules,
        ),
      ).toMatchInlineSnapshot(`
        [
          "body .foo{padding-left:10px;}",
          "body .rtl-foo{padding-right:10px;}",
        ]
      `);
    });
  });

  describe('@scope', () => {
    it('wraps the rule in @scope and substitutes the class with :scope', () => {
      expect(
        compileAtomicCSSRule(
          {
            ...defaultOptions,
            property: 'color',
            value: 'red',
          },
          { ...defaultAtRules, scope: 'to (.boundary)' },
        ),
      ).toMatchInlineSnapshot(`
        [
          "@scope (.foo) to (.boundary){:scope{color:red;}}",
        ]
      `);
    });

    it('preserves pseudos under @scope', () => {
      expect(
        compileAtomicCSSRule(
          {
            ...defaultOptions,
            selectors: [':hover'],
            property: 'color',
            value: 'red',
          },
          { ...defaultAtRules, scope: 'to (.boundary)' },
        ),
      ).toMatchInlineSnapshot(`
        [
          "@scope (.foo) to (.boundary){:scope:hover{color:red;}}",
        ]
      `);
    });

    it('emits separate @scope blocks for LTR and RTL with direction-specific roots', () => {
      expect(
        compileAtomicCSSRule(
          {
            ...defaultOptions,
            property: 'paddingLeft',
            value: '10px',

            rtlProperty: 'paddingRight',
            rtlValue: '10px',
          },
          { ...defaultAtRules, scope: 'to (.boundary)' },
        ),
      ).toMatchInlineSnapshot(`
        [
          "@scope (.foo) to (.boundary){:scope{padding-left:10px;}}",
          "@scope (.rtl-foo) to (.boundary){:scope{padding-right:10px;}}",
        ]
      `);
    });

    it('places @scope as the innermost wrapper under @media', () => {
      expect(
        compileAtomicCSSRule(
          {
            ...defaultOptions,
            property: 'color',
            value: 'red',
          },
          { ...defaultAtRules, media: '(max-width: 100px)', scope: 'to (.boundary)' },
        ),
      ).toMatchInlineSnapshot(`
        [
          "@media (max-width: 100px){@scope (.foo) to (.boundary){:scope{color:red;}}}",
        ]
      `);
    });

    it('places @scope as the innermost wrapper under @layer', () => {
      expect(
        compileAtomicCSSRule(
          {
            ...defaultOptions,
            property: 'color',
            value: 'red',
          },
          { ...defaultAtRules, layer: 'utilities', scope: 'to (.boundary)' },
        ),
      ).toMatchInlineSnapshot(`
        [
          "@layer utilities{@scope (.foo) to (.boundary){:scope{color:red;}}}",
        ]
      `);
    });

    it('rebases nested descendant selectors onto :scope', () => {
      expect(
        compileAtomicCSSRule(
          {
            ...defaultOptions,
            selectors: ['& .baz'],
            property: 'color',
            value: 'red',
          },
          { ...defaultAtRules, scope: 'to (.boundary)' },
        ),
      ).toMatchInlineSnapshot(`
        [
          "@scope (.foo) to (.boundary){:scope .baz{color:red;}}",
        ]
      `);
    });

    it('handles :hover with a nested class descendant', () => {
      expect(
        compileAtomicCSSRule(
          {
            ...defaultOptions,
            selectors: [':hover .nested'],
            property: 'color',
            value: 'red',
          },
          { ...defaultAtRules, scope: 'to (.boundary)' },
        ),
      ).toMatchInlineSnapshot(`
        [
          "@scope (.foo) to (.boundary){:scope:hover .nested{color:red;}}",
        ]
      `);
    });
  });
});

describe('normalizePseudoSelector', () => {
  it('handles basic ', () => {
    expect(normalizePseudoSelector(':hover')).toMatchInlineSnapshot(`"&:hover"`);
  });

  it('handles spacing', () => {
    expect(normalizePseudoSelector(' :hover')).toMatchInlineSnapshot(`"& :hover"`);
  });

  it('handles multiple pseudos', () => {
    expect(normalizePseudoSelector(':focus:hover')).toMatchInlineSnapshot(`"&:focus:hover"`);
  });

  it('handles comma separated pseudos', () => {
    expect(normalizePseudoSelector('& :hover, & :focus')).toMatchInlineSnapshot(`"& :hover, & :focus"`);
    expect(normalizePseudoSelector(':focus,:hover')).toMatchInlineSnapshot(`"&:focus,&:hover"`);
    expect(normalizePseudoSelector(':focus, :hover')).toMatchInlineSnapshot(`"&:focus,& :hover"`);
  });
});
