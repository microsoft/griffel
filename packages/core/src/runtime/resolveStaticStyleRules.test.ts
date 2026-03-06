import { describe, it, expect } from 'vitest';
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
      [
        "@font-face{font-family:Open Sans;src:url("webfont.woff2") format("woff2");}",
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
      [
        "body{background:blue;}",
        ".foo{background:yellow;margin-left:5px;}",
      ]
    `);
  });

  it('handles css string', () => {
    expect(resolveStaticStyleRules(['body {background: red;} div {color: green;}'])).toMatchInlineSnapshot(`
      [
        "body{background:red;}",
        "div{color:green;}",
      ]
    `);
  });

  it('handles fallbacks', () => {
    expect(
      resolveStaticStyleRules([
        {
          body: {
            display: ['flex', '-webkit-flex'],
          },
        },
      ]),
    ).toMatchInlineSnapshot(`
      [
        "body{display:flex;display:-webkit-flex;}",
      ]
    `);
  });
});
