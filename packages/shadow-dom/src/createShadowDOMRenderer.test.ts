import { describe, it, expect, beforeEach } from 'vitest';
import { createShadowDOMRenderer } from './createShadowDOMRenderer.js';
import type { ExtendedCSSStyleSheet } from './types.js';

type CSSStyleSheetWithId = CSSStyleSheet & { id: string };

function createSheetWithId(id: string) {
  const sheet = new CSSStyleSheet() as CSSStyleSheetWithId;
  sheet.id = id;

  return sheet;
}

expect.addSnapshotSerializer({
  test(value) {
    return Array.isArray(value);
  },
  print(value) {
    /**
     * test function makes sure that value is the guarded type
     */
    const _value = value as Array<ExtendedCSSStyleSheet | CSSStyleSheetWithId | CSSStyleSheet>;

    return JSON.stringify(
      _value.map(sheet => ({
        ...(Object.hasOwnProperty.call(sheet, 'bucketName') && {
          bucketName: (sheet as ExtendedCSSStyleSheet).bucketName,
          metadata: (sheet as ExtendedCSSStyleSheet).metadata,
        }),
        ...(Object.hasOwnProperty.call(sheet, 'id') && { id: (sheet as CSSStyleSheetWithId).id }),
      })),
      null,
      2,
    );
  },
});

describe('createShadowDOMRenderer', () => {
  let shadowRoot: ShadowRoot;
  let renderer: ReturnType<typeof createShadowDOMRenderer>;

  beforeEach(() => {
    shadowRoot = document.createElement('div').attachShadow({ mode: 'open' });

    // jsdom doesn't support adoptedStyleSheets yet
    shadowRoot.adoptedStyleSheets = [];
  });

  it('returns a renderer', () => {
    expect(createShadowDOMRenderer(shadowRoot)).toHaveProperty('adoptedStyleSheets');
  });

  describe('sheets ordering', () => {
    it('handles bucket order', () => {
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

      expect(renderer.adoptedStyleSheets).toMatchInlineSnapshot(`
        [
          {
            "bucketName": "d",
            "metadata": {}
          },
          {
            "bucketName": "l",
            "metadata": {}
          },
          {
            "bucketName": "v",
            "metadata": {}
          },
          {
            "bucketName": "f",
            "metadata": {}
          },
          {
            "bucketName": "h",
            "metadata": {}
          },
          {
            "bucketName": "a",
            "metadata": {}
          },
          {
            "bucketName": "t",
            "metadata": {}
          },
          {
            "bucketName": "m",
            "metadata": {
              "m": "(forced-colors: active)"
            }
          },
          {
            "bucketName": "m",
            "metadata": {
              "m": "(prefers-reduced-motion)"
            }
          }
        ]
      `);
    });

    it('handles priorities of CSS rules', () => {
      renderer = createShadowDOMRenderer(shadowRoot);

      renderer.insertCSSRules({
        d: ['.prio0 {}', ['.prio-2 {}', { p: -2 }], ['.prio-1 {}', { p: -1 }], ['.prio-3 {}', { p: -3 }]],
      });
      renderer.insertCSSRules({ f: ['.prio0:focus {}', ['.prio-1:focus {}', { p: -1 }]] });

      expect(renderer.adoptedStyleSheets).toMatchInlineSnapshot(`
        [
          {
            "bucketName": "d",
            "metadata": {
              "p": -3
            }
          },
          {
            "bucketName": "d",
            "metadata": {
              "p": -2
            }
          },
          {
            "bucketName": "d",
            "metadata": {
              "p": -1
            }
          },
          {
            "bucketName": "d",
            "metadata": {}
          },
          {
            "bucketName": "f",
            "metadata": {
              "p": -1
            }
          },
          {
            "bucketName": "f",
            "metadata": {}
          }
        ]
      `);
    });
  });

  describe('insertionPoint', () => {
    it('inserts sheets after other sheets by default', () => {
      const other1 = createSheetWithId('other1');
      const other2 = createSheetWithId('other2');

      shadowRoot.adoptedStyleSheets = [other1, other2];
      renderer = createShadowDOMRenderer(shadowRoot);

      renderer.insertCSSRules({ d: ['a {}'] });
      renderer.insertCSSRules({ t: ['a {}'] });

      expect(shadowRoot.adoptedStyleSheets).toMatchInlineSnapshot(`
        [
          {
            "id": "other1"
          },
          {
            "id": "other2"
          },
          {
            "bucketName": "d",
            "metadata": {}
          },
          {
            "bucketName": "t",
            "metadata": {}
          }
        ]
      `);
    });

    it('inserts styles in the correct order with insertionPoint', () => {
      const other1 = createSheetWithId('other1');
      const other2 = createSheetWithId('other2');
      const insertionPoint = createSheetWithId('insertionPoint');

      shadowRoot.adoptedStyleSheets = [other1, insertionPoint, other2];

      renderer = createShadowDOMRenderer(shadowRoot, {
        insertionPoint,
      });

      renderer.insertCSSRules({ d: ['a {}'] });
      renderer.insertCSSRules({ t: ['a {}'] });
      renderer.insertCSSRules({ h: ['a {}'] });
      renderer.insertCSSRules({ f: ['a {}'] });

      expect(shadowRoot.adoptedStyleSheets).toMatchInlineSnapshot(`
        [
          {
            "id": "other1"
          },
          {
            "id": "insertionPoint"
          },
          {
            "bucketName": "d",
            "metadata": {}
          },
          {
            "bucketName": "f",
            "metadata": {}
          },
          {
            "bucketName": "h",
            "metadata": {}
          },
          {
            "bucketName": "t",
            "metadata": {}
          },
          {
            "id": "other2"
          }
        ]
      `);
    });
  });

  describe('cascadeLayer', () => {
    it('inserts rules into cascade layers, keeps cache keys unwrapped', () => {
      renderer = createShadowDOMRenderer(shadowRoot, { cascadeLayer: bucketName => `app.${bucketName}` });

      renderer.insertCSSRules({
        d: ['.a{color:red;}', '@layer author{.b{color:blue;}}'],
        m: [['@media (min-width: 1px){.c{color:red;}}', { m: '(min-width: 1px)' }]],
      });
      // 👇 a duplicate is not inserted again
      renderer.insertCSSRules({ d: ['.a{color:red;}'] });

      const sheets = renderer.adoptedStyleSheets!.map(sheet => ({
        layer: sheet.layer,
        cssText: Array.from(sheet.cssRules)
          .map(rule => rule.cssText.replace(/\s+/g, ''))
          .join(''),
      }));

      expect(sheets).toEqual([
        { layer: 'app.d', cssText: expect.stringContaining('.a{color:red;}') },
        { layer: 'app.m', cssText: expect.stringContaining('@media(min-width:1px){.c{color:red;}}') },
      ]);
      expect(sheets[0].cssText).toContain('@layerauthor{.b{color:blue;}}');
      expect(sheets[0].cssText.match(/\.a\{/g)).toHaveLength(1);
      expect(Object.keys(renderer.insertionCache)).toEqual([
        '.a{color:red;}',
        '@layer author{.b{color:blue;}}',
        '@media (min-width: 1px){.c{color:red;}}',
      ]);
    });
  });
});
