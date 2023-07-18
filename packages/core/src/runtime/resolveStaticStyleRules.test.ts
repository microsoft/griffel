import { resolveStaticStyleRules } from './resolveStaticStyleRules';

describe('resolveStaticStyleRules', () => {
  it('handles font-face', () => {
    expect(
      resolveStaticStyleRules([
        {
          '@font-face': {
            fontFamily: 'Open Sans',
            src: `url("webfont.woff2") format("woff2")`,
          },
        },
      ]),
    ).toMatchInlineSnapshot(`
      Array [
        "@font-face{font-family:Open Sans;src:url(\\"webfont.woff2\\") format(\\"woff2\\");}",
      ]
    `);
  });

  it('handles static css', () => {
    expect(
      resolveStaticStyleRules([
        {
          body: {
            background: 'blue',
          },
          '.foo': {
            background: 'yellow',
            marginLeft: '5px',
          },
        },
      ]),
    ).toMatchInlineSnapshot(`
      Array [
        "body{background:blue;}",
        ".foo{background:yellow;margin-left:5px;}",
      ]
    `);
  });

  it('handles css string', () => {
    expect(resolveStaticStyleRules(['body {background: red;} div {color: green;}'])).toMatchInlineSnapshot(`
      Array [
        "body{background:red;}",
        "div{color:green;}",
      ]
    `);
  });
});
