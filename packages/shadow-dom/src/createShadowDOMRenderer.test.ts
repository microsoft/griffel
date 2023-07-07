import { createShadowDOMRenderer } from './createShadowDOMRenderer';

describe('createShadowDOMRenderer', () => {
  it('returns a renderer', () => {
    const shadowRoot = document.createElement('div').attachShadow({ mode: 'open' });

    expect(createShadowDOMRenderer(shadowRoot)).toHaveProperty('adoptedStyleSheets');
  });

  describe('CSS insertion', () => {
    const shadowRoot = document.createElement('div').attachShadow({ mode: 'open' });
    const renderer = createShadowDOMRenderer(shadowRoot);

    // jsdom doesn't support adoptedStyleSheets yet
    shadowRoot.adoptedStyleSheets = [];

    renderer.insertCSSRules({ d: ['a {}'] });
    renderer.insertCSSRules({ t: ['a {}'] });

    renderer.insertCSSRules({
      m: [[`a {}`, { m: '(forced-colors: active)' }]],
    });
    renderer.insertCSSRules({
      m: [[`a {}`, { m: '(prefers-reduced-motion)' }]],
    });

    renderer.insertCSSRules({ h: ['a {}'] });
    renderer.insertCSSRules({ f: ['a {}'] });
    renderer.insertCSSRules({ a: ['a {}'] });
    renderer.insertCSSRules({ v: ['a {}'] });
    renderer.insertCSSRules({ l: ['a {}'] });

    renderer.insertCSSRules({ t: ['a {}'] });

    expect(renderer.adoptedStyleSheets?.map(sheet => ({ bucketName: sheet.bucketName, metadata: sheet.metadata })))
      .toMatchInlineSnapshot(`
      Array [
        Object {
          "bucketName": "d",
          "metadata": Object {},
        },
        Object {
          "bucketName": "l",
          "metadata": Object {},
        },
        Object {
          "bucketName": "v",
          "metadata": Object {},
        },
        Object {
          "bucketName": "f",
          "metadata": Object {},
        },
        Object {
          "bucketName": "h",
          "metadata": Object {},
        },
        Object {
          "bucketName": "a",
          "metadata": Object {},
        },
        Object {
          "bucketName": "t",
          "metadata": Object {},
        },
        Object {
          "bucketName": "m",
          "metadata": Object {
            "m": "(forced-colors: active)",
          },
        },
        Object {
          "bucketName": "m",
          "metadata": Object {
            "m": "(prefers-reduced-motion)",
          },
        },
      ]
    `);
  });
});
