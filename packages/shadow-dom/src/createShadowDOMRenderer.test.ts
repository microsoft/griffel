import { createShadowDOMRenderer } from './createShadowDOMRenderer';
import { ExtendedCSSStyleSheet } from './types';

type CSSStyleSheetWithId = CSSStyleSheet & { id: string };

describe('createShadowDOMRenderer', () => {
  it('returns a renderer', () => {
    const shadowRoot = document.createElement('div').attachShadow({ mode: 'open' });

    expect(createShadowDOMRenderer(shadowRoot)).toHaveProperty('adoptedStyleSheets');
  });

  describe('CSS insertion', () => {
    let shadowRoot: ShadowRoot;
    let renderer: ReturnType<typeof createShadowDOMRenderer>;

    beforeEach(() => {
      shadowRoot = document.createElement('div').attachShadow({ mode: 'open' });

      // jsdom doesn't support adoptedStyleSheets yet
      shadowRoot.adoptedStyleSheets = [];
    });

    it('inserts styles in the correct order', () => {
      renderer = createShadowDOMRenderer(shadowRoot);

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

    it('inserts styles in the correct order with insertionPoint', () => {
      const other1 = new CSSStyleSheet() as CSSStyleSheetWithId;
      other1.id = 'other1';

      const other2 = new CSSStyleSheet() as CSSStyleSheetWithId;
      other2.id = 'other2';

      const insertionPoint = new CSSStyleSheet() as CSSStyleSheetWithId;
      insertionPoint.id = 'insertionPoint';
      shadowRoot.adoptedStyleSheets = [other1, insertionPoint, other2];

      renderer = createShadowDOMRenderer(shadowRoot, {
        insertionPoint: insertionPoint as unknown as ExtendedCSSStyleSheet,
      });

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

      const res = shadowRoot.adoptedStyleSheets?.map(sheet => {
        if ('bucketName' in sheet) {
          const eSheet = sheet as ExtendedCSSStyleSheet;
          return { bucketName: eSheet.bucketName, metadata: eSheet.metadata };
        } else {
          return { id: (sheet as unknown as CSSStyleSheetWithId).id };
        }
      });

      expect(res).toMatchInlineSnapshot(`
          Array [
            Object {
              "id": "other1",
            },
            Object {
              "id": "insertionPoint",
            },
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
            Object {
              "id": "other2",
            },
          ]
        `);
    });
  });
});
