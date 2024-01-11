import { compileAtomicCSSRule, normalizePseudoSelector } from './compileAtomicCSSRule';
import type { CompileAtomicCSSOptions } from './compileAtomicCSSRule';

const defaultOptions: Pick<
  CompileAtomicCSSOptions,
  'rtlClassName' | 'className' | 'media' | 'selectors' | 'support' | 'layer' | 'container'
> = {
  className: 'foo',
  rtlClassName: 'rtl-foo',
  media: '',
  selectors: [],
  support: '',
  layer: '',
  container: '',
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
      compileAtomicCSSRule({
        ...defaultOptions,
        property,
        value,
      }),
    ).toMatchSnapshot();
  });

  it('handles pseudo', () => {
    expect(
      compileAtomicCSSRule({
        ...defaultOptions,
        selectors: [':hover'],
        property: 'color',
        value: 'red',
      }),
    ).toMatchInlineSnapshot(`
      Array [
        ".foo:hover{color:red;}",
      ]
    `);
    expect(
      compileAtomicCSSRule({
        ...defaultOptions,
        selectors: [':focus:hover'],
        property: 'color',
        value: 'red',
      }),
    ).toMatchInlineSnapshot(`
      Array [
        ".foo:focus:hover{color:red;}",
      ]
    `);
  });

  it('handles array of values', () => {
    expect(
      compileAtomicCSSRule({
        ...defaultOptions,
        property: 'color',
        value: ['red', 'blue'],
      }),
    ).toMatchInlineSnapshot(`
      Array [
        ".foo{color:red;color:blue;}",
      ]
    `);
  });

  it('handles at-rules', () => {
    expect(
      compileAtomicCSSRule({
        ...defaultOptions,
        media: '(max-width: 100px)',
        property: 'color',
        value: 'red',
      }),
    ).toMatchInlineSnapshot(`
      Array [
        "@media (max-width: 100px){.foo{color:red;}}",
      ]
    `);
    expect(
      compileAtomicCSSRule({
        ...defaultOptions,
        support: '(display: table-cell)',
        property: 'color',
        value: 'red',
      }),
    ).toMatchInlineSnapshot(`
      Array [
        "@supports (display: table-cell){.foo{color:red;}}",
      ]
    `);
  });

  it('handles rtl properties', () => {
    expect(
      compileAtomicCSSRule({
        ...defaultOptions,

        property: 'paddingLeft',
        value: '10px',

        rtlProperty: 'paddingRight',
        rtlValue: '10px',
      }),
    ).toMatchInlineSnapshot(`
      Array [
        ".foo{padding-left:10px;}",
        ".rtl-foo{padding-right:10px;}",
      ]
    `);
  });

  it('handles rtl properties with pseudo selectors', () => {
    expect(
      compileAtomicCSSRule({
        ...defaultOptions,
        selectors: [':before'],

        property: 'paddingLeft',
        value: '10px',

        rtlProperty: 'paddingRight',
        rtlValue: '10px',
      }),
    ).toMatchInlineSnapshot(`
      Array [
        ".foo:before{padding-left:10px;}",
        ".rtl-foo:before{padding-right:10px;}",
      ]
    `);
  });

  it('handles rtl properties with fallback values', () => {
    expect(
      compileAtomicCSSRule({
        ...defaultOptions,
        property: 'paddingLeft',
        value: [0, '10px'],
        rtlProperty: 'paddingRight',
        rtlValue: [0, '10px'],
      }),
    ).toMatchInlineSnapshot(`
      Array [
        ".foo{padding-left:0;padding-left:10px;}",
        ".rtl-foo{padding-right:0;padding-right:10px;}",
      ]
    `);
  });

  describe('global', () => {
    it('compiles global rules', () => {
      expect(
        compileAtomicCSSRule({
          ...defaultOptions,
          selectors: [':global(body)'],
          property: 'color',
          value: 'red',
        }),
      ).toMatchInlineSnapshot(`
              Array [
                "body .foo{color:red;}",
              ]
          `);
      expect(
        compileAtomicCSSRule({
          ...defaultOptions,
          selectors: [':global(.fui-FluentProvider)', '& .focus:hover'],
          property: 'color',
          value: 'red',
        }),
      ).toMatchInlineSnapshot(`
              Array [
                ".fui-FluentProvider .foo .focus:hover{color:red;}",
              ]
          `);
    });

    it('compiles global rules with RTL', () => {
      expect(
        compileAtomicCSSRule({
          ...defaultOptions,
          selectors: [':global(body)'],
          property: 'paddingLeft',
          value: '10px',

          rtlProperty: 'paddingRight',
          rtlValue: '10px',
        }),
      ).toMatchInlineSnapshot(`
              Array [
                "body .foo{padding-left:10px;}",
                "body .rtl-foo{padding-right:10px;}",
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
