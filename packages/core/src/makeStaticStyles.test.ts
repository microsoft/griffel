import { createDOMRenderer } from './renderer/createDOMRenderer';
import { griffelRendererSerializer } from './common/snapshotSerializers';
import { makeStaticStyles } from './makeStaticStyles';
import { makeStyles } from './makeStyles';
import type { GriffelRenderer } from './types';

expect.addSnapshotSerializer(griffelRendererSerializer);

describe('makeStaticStyles', () => {
  let renderer: GriffelRenderer;

  beforeEach(() => {
    renderer = createDOMRenderer(document);
  });

  it('handles static styles', () => {
    const useStyles = makeStaticStyles({
      body: {
        background: 'blue',
        transition: 'all 4s ease',
      },
      '.foo': {
        background: 'yellow',
        marginLeft: '5px',
      },
    });

    useStyles({ renderer });

    expect(renderer).toMatchInlineSnapshot(`
      /** bucket "d" **/
      body {
        background: blue;
        transition: all 4s ease;
      }
      .foo {
        background: yellow;
        margin-left: 5px;
      }
    `);
  });

  it('handles styles array', () => {
    const useStyles = makeStaticStyles([
      {
        '@font-face': {
          fontFamily: 'Open Sans',
          src: `url("/fonts/OpenSans-Regular-webfont.woff") format("woff")`,
        },
      },
      {
        '@font-face': {
          fontFamily: 'My Font',
          src: `url(my-font.woff)`,
        },
      },
    ]);

    useStyles({ renderer });

    expect(renderer).toMatchInlineSnapshot(`
      /** bucket "d" **/
      @font-face {
        font-family: Open Sans;
        src: url("/fonts/OpenSans-Regular-webfont.woff") format("woff");
      }
      @font-face {
        font-family: My Font;
        src: url(my-font.woff);
      }
    `);
  });

  it('handles css string', () => {
    const useStyles = makeStaticStyles('body {background: red;} div {color: green;}');

    useStyles({ renderer });

    expect(renderer).toMatchInlineSnapshot(`
      /** bucket "d" **/
      body {
        background: red;
      }
      div {
        color: green;
      }
    `);
  });

  it('handles caching to avoid duplicated styles', () => {
    const useStyles = makeStaticStyles({
      body: {
        background: 'blue',
      },
    });

    const useStyles2 = makeStaticStyles({
      body: {
        background: 'blue',
      },
    });

    useStyles({ renderer });
    useStyles({ renderer });
    useStyles2({ renderer });

    expect(renderer).toMatchInlineSnapshot(`
      /** bucket "d" **/
      body {
        background: blue;
      }
    `);
  });

  it('can be used with makeStyles', () => {
    const useStaticStyles = makeStaticStyles({
      '@font-face': {
        fontFamily: 'Open Sans',
        src: `url("/fonts/OpenSans-Regular-webfont.woff") format("woff")`,
      },
    });

    const useStyles = makeStyles({
      root: { fontFamily: 'Open Sans', fontSize: '16px' },
    });

    useStaticStyles({ renderer });
    expect(useStyles({ dir: 'ltr', renderer }).root).toBe('___23yvam0_0000000 fy9yzz7 f4ybsrx');

    expect(renderer).toMatchInlineSnapshot(`
      /** bucket "d" **/
      @font-face {
        font-family: Open Sans;
        src: url("/fonts/OpenSans-Regular-webfont.woff") format("woff");
      }
      .fy9yzz7 {
        font-family: Open Sans;
      }
      .f4ybsrx {
        font-size: 16px;
      }
    `);
  });
});
