import { compileCSS, CompileCSSOptions, normalizePseudoSelector } from './compileCSS';

const defaultOptions: Pick<
  CompileCSSOptions,
  'rtlClassName' | 'className' | 'media' | 'selectors' | 'support' | 'layer'
> = {
  className: 'foo',
  rtlClassName: 'rtl-foo',
  media: '',
  selectors: [],
  support: '',
  layer: '',
};

describe('compileCSS', () => {
  it('handles pseudo', () => {
    expect(
      compileCSS({
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
      compileCSS({
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
      compileCSS({
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
      compileCSS({
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
      compileCSS({
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
      compileCSS({
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
      compileCSS({
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
      compileCSS({
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
        compileCSS({
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
        compileCSS({
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
        compileCSS({
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
