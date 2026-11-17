import { beforeEach, describe, expect, it, vi } from 'vitest';
import { makeStaticStyles } from '../makeStaticStyles.js';
import { makeStyles } from '../makeStyles.js';
import type { CSSRulesByBucket, GriffelCascadeLayerFn, GriffelRenderer } from '../types.js';
import { createDOMRenderer } from './createDOMRenderer.js';
import { getCascadeLayerOrder } from './getCascadeLayerOrder.js';
import { styleBucketOrdering } from './getStyleSheetForBucket.js';
import { rehydrateRendererCache } from './rehydrateRendererCache.js';

const cascadeLayer: GriffelCascadeLayerFn = (bucketName, metadata) =>
  `app.${bucketName}${metadata.p ? `.p${metadata.p}` : ''}`;

/** A renderer that has no document, i.e. the one used on a server. */
function createServerRenderer(options: Parameters<typeof createDOMRenderer>[1] = {}): GriffelRenderer {
  return createDOMRenderer(null as unknown as undefined, options);
}

/** Mirrors `renderToStyleElements()` from `@griffel/react`. */
function flushToDocument(renderer: GriffelRenderer): void {
  Object.values(renderer.stylesheets)
    .sort((a, b) => styleBucketOrdering.indexOf(a.bucketName) - styleBucketOrdering.indexOf(b.bucketName))
    .forEach(stylesheet => {
      const cssRules = stylesheet.cssRules();

      if (!cssRules.length) {
        return;
      }

      const styleElement = document.createElement('style');

      for (const attribute of Object.keys(stylesheet.elementAttributes)) {
        styleElement.setAttribute(attribute, stylesheet.elementAttributes[attribute]);
      }

      styleElement.textContent = cssRules.join('');
      document.head.appendChild(styleElement);
    });
}

function getServerCSS(renderer: GriffelRenderer): Record<string, string> {
  return Object.fromEntries(
    Object.entries(renderer.stylesheets).map(([key, stylesheet]) => [key, stylesheet.cssRules().join('')]),
  );
}

const useStyles = makeStyles({
  root: {
    color: 'red',
    padding: '4px',
    paddingLeft: '8px',
    ':hover': { color: 'blue' },
    ':active': { color: 'lime' },
    '@media (min-width: 100px)': { color: 'pink' },
    '@media (forced-colors: active)': { color: 'CanvasText' },
    '@supports (display: grid)': { display: 'grid' },
    '@layer author': { color: 'teal' },
    animationName: { from: { opacity: 0 }, to: { opacity: 1 } },
  },
});

describe('cascadeLayer', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
  });

  describe('getCascadeLayerOrder', () => {
    it('declares layers in the bucket order', () => {
      expect(getCascadeLayerOrder(bucketName => `app.${bucketName}`)).toBe(
        '@layer app.r, app.d, app.l, app.v, app.w, app.f, app.i, app.h, app.a, app.s, app.k, app.t, app.m, app.c, app.x;',
      );
    });

    it('supports multiple layers per bucket & skips unlayered buckets', () => {
      expect(
        getCascadeLayerOrder(bucketName =>
          bucketName === 'd' || bucketName === 'h' ? [`f.${bucketName}.components`, `f.${bucketName}.griffel`] : null,
        ),
      ).toBe('@layer f.d.components, f.d.griffel, f.h.components, f.h.griffel;');
    });

    it('supports layers per priority', () => {
      expect(
        getCascadeLayerOrder((bucketName, { p }) => (bucketName === 'd' ? `d.p${p ?? 0}` : undefined), {
          priorities: [0, -1],
        }),
      ).toBe('@layer d.p-1, d.p0;');
    });

    it('returns an empty string without layers', () => {
      expect(getCascadeLayerOrder(() => undefined)).toBe('');
    });
  });

  describe('SSR', () => {
    it('is byte-identical when the option is not set', () => {
      const rendererA = createServerRenderer();
      const rendererB = createServerRenderer({ cascadeLayer: undefined });
      const rendererC = createServerRenderer({ cascadeLayer: () => undefined });

      useStyles({ dir: 'ltr', renderer: rendererA });
      useStyles({ dir: 'ltr', renderer: rendererB });
      useStyles({ dir: 'ltr', renderer: rendererC });

      expect(getServerCSS(rendererB)).toEqual(getServerCSS(rendererA));
      expect(getServerCSS(rendererC)).toEqual(getServerCSS(rendererA));
      expect(Object.keys(rendererA)).not.toContain('cascadeLayer');
    });

    it('wraps every style sheet into a single layer block', () => {
      const renderer = createServerRenderer({ cascadeLayer });
      useStyles({ dir: 'ltr', renderer });

      expect(getServerCSS(renderer)).toMatchInlineSnapshot(`
        {
          "a0": "@layer app.a{.f85v2kq:active{color:lime;}}",
          "d-1": "@layer app.d.p-1{.fd3pd8h{padding:4px;}}",
          "d0": "@layer app.d{.fe3e8s9{color:red;}.f177v4lu{padding-left:8px;}.f19lj068{padding-right:8px;}.f1h7u52p{animation-name:f5j8bii;}}",
          "h0": "@layer app.h{.f10q6zxg:hover{color:blue;}}",
          "k0": "@layer app.k{@keyframes f5j8bii{from{opacity:0;}to{opacity:1;}}}",
          "m(forced-colors: active)0": "@layer app.m{@media (forced-colors: active){.fslfhp6{color:CanvasText;}}}",
          "m(min-width: 100px)0": "@layer app.m{@media (min-width: 100px){.f1805djf{color:pink;}}}",
          "t0": "@layer app.t{@supports (display: grid){.f1xf19n{display:grid;}}}@layer author{.fz7ct4p{color:teal;}}",
        }
      `);
    });

    it('keeps insertion cache keys, filters & devtools on unwrapped rules', () => {
      const filter = vi.fn().mockReturnValue(true);
      const renderer = createServerRenderer({ cascadeLayer, unstable_filterCSSRule: filter });
      useStyles({ dir: 'ltr', renderer });

      const keys = Object.keys(renderer.insertionCache);

      expect(keys).toContain('.fe3e8s9{color:red;}');
      expect(keys.filter(key => key.startsWith('@layer author{'))).toHaveLength(1);
      expect(keys.some(key => key.startsWith('@layer app.'))).toBe(false);
      expect(filter).toHaveBeenCalledWith('.fe3e8s9{color:red;}');
      expect(filter.mock.calls.some(([rule]) => rule.startsWith('@layer app.'))).toBe(false);
    });

    it('passes only style sheet metadata to the callback', () => {
      const callback = vi.fn().mockReturnValue('layer');
      const renderer = createServerRenderer({ cascadeLayer: callback });
      const cssRules: CSSRulesByBucket = {
        d: ['.a{color:red;}', ['.b{padding:0;}', { p: -1 }]],
        m: [['@media (min-width: 1px){.c{color:red;}}', { m: '(min-width: 1px)' }]],
        x: [['@container (min-width: 1px){.d{color:red;}}', { x: '(min-width: 1px)', p: -1 }]],
      };

      renderer.insertCSSRules(cssRules);

      expect(callback.mock.calls).toEqual([
        ['d', {}],
        ['d', { p: -1 }],
        ['m', { m: '(min-width: 1px)' }],
        ['x', { p: -1, x: '(min-width: 1px)' }],
      ]);
    });

    it('puts static styles into the layer of the default bucket', () => {
      const renderer = createServerRenderer({ cascadeLayer });
      makeStaticStyles({ body: { margin: 0 } })({ renderer });

      expect(getServerCSS(renderer)).toEqual({ d0: '@layer app.d{body{margin:0;}}' });
    });
  });

  describe('rehydration', () => {
    it('does not insert server-rendered rules again', () => {
      const serverRenderer = createServerRenderer({ cascadeLayer });
      useStyles({ dir: 'ltr', renderer: serverRenderer });
      flushToDocument(serverRenderer);

      const serverHTML = document.head.innerHTML;

      const clientRenderer = createDOMRenderer(document, { cascadeLayer });
      rehydrateRendererCache(clientRenderer, document);

      expect(Object.keys(clientRenderer.insertionCache).sort()).toEqual(
        Object.keys(serverRenderer.insertionCache).sort(),
      );

      const insertRule = vi.spyOn(CSSStyleSheet.prototype, 'insertRule');
      useStyles({ dir: 'ltr', renderer: clientRenderer });

      expect(insertRule).not.toHaveBeenCalled();
      expect(document.head.innerHTML).toBe(serverHTML);

      insertRule.mockRestore();
    });

    it('does not unwrap layers if the option is not set', () => {
      const serverRenderer = createServerRenderer();
      useStyles({ dir: 'ltr', renderer: serverRenderer });
      flushToDocument(serverRenderer);

      const clientRenderer = createDOMRenderer(document);
      rehydrateRendererCache(clientRenderer, document);

      expect(Object.keys(clientRenderer.insertionCache).sort()).toEqual(
        Object.keys(serverRenderer.insertionCache).sort(),
      );
    });
  });

  describe('DOM', () => {
    it('inserts rules into layers', () => {
      const renderer = createDOMRenderer(document, { cascadeLayer });
      renderer.insertCSSRules({ d: ['.a{color:red;}', '.b{color:blue;}', '@layer author{.c{color:teal;}}'] });

      const styleElement = document.head.querySelector('style')!;
      const cssText = Array.from(styleElement.sheet!.cssRules)
        .map(rule => rule.cssText.replace(/\s+/g, ''))
        .join('');

      // 👇 jsdom has no CSSLayerBlockRule, so rules are wrapped one by one; browsers get a single block
      expect(cssText).toContain('.a{color:red;}');
      expect(cssText).toContain('.b{color:blue;}');
      expect(cssText).toContain('@layerauthor{.c{color:teal;}}');
      expect(cssText).not.toContain('app.d.author');
      expect(Object.keys(renderer.insertionCache)).toEqual([
        '.a{color:red;}',
        '.b{color:blue;}',
        '@layer author{.c{color:teal;}}',
      ]);
    });
  });
});
