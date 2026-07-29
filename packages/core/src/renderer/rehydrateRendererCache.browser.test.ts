// Exercises the full server-side rendering flow in a real browser: render styles with a server
// renderer, emit them into `<style>` elements exactly like `renderToStyleElements()` does, then
// rehydrate a client renderer against that markup.
//
// The point of `rehydrateRendererCache()` is that the client must recognise every rule the server
// already sent. A rule it fails to recognise gets inserted a second time, which both bloats the
// stylesheet and moves that rule to the end of its bucket — where it can start winning the cascade
// against rules that were meant to override it.
//
// jsdom cannot back these assertions: it neither resolves the cascade nor reports which of two
// competing rules won, so the effects of a missed rule are only observable in a real browser.

import { beforeEach, describe, expect, test } from 'vitest';
import { createDOMRenderer, makeStyles } from '../index.js';
import type { GriffelRenderer, GriffelStyle } from '../index.js';
import { COLORS, getColor, render, resetBrowserTestState } from '../common/browserHelpers.js';
import { styleBucketOrdering } from './getStyleSheetForBucket.js';
import { rehydrateRendererCache } from './rehydrateRendererCache.js';

beforeEach(resetBrowserTestState);

const LTR = { dir: 'ltr' } as const;

/**
 * Creates the renderer a server would use — one with no document, which collects rule strings
 * verbatim instead of handing them to CSSOM.
 *
 * Passing `undefined` would fall back to the real `document` (it is the parameter's default), so
 * `null` is used to reach the same "no document" branches the server takes.
 */
function createServerRenderer(): GriffelRenderer {
  return createDOMRenderer(null as unknown as undefined);
}

/**
 * Mirrors `renderToStyleElements()` from `@griffel/react`: sorts the renderer's sheets by bucket
 * order and writes each one's rules into a `<style>` element as a single joined string.
 */
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

/** Every CSS rule live in the document, read back through the browser's own CSSOM. */
function getInsertedCSSRules(): string[] {
  return Array.from(document.head.querySelectorAll<HTMLStyleElement>('style[data-make-styles-bucket]')).flatMap(
    styleElement => Array.from(styleElement.sheet!.cssRules).map(cssRule => cssRule.cssText),
  );
}

describe('rehydrateRendererCache', () => {
  test('does not re-insert server-rendered rules when the client renders the same styles', () => {
    // A spread of buckets and at-rules, so a regression in any one of them surfaces here.
    const styles: Record<string, GriffelStyle> = {
      plain: { color: 'red', paddingLeft: '10px' },
      pseudo: { ':hover': { color: 'blue' }, ':focus-visible': { color: 'lime' } },
      descendant: { '& .child': { color: 'red' } },
      global: { ':global(.global-target)': { color: 'red' } },
      media: { '@media (min-width: 100px)': { color: 'red' } },
      supports: { '@supports (display: grid)': { color: 'blue' } },
      container: { '@container slot (min-width: 480px)': { color: 'red' } },
      keyframes: { animationName: { from: { opacity: 0 }, to: { opacity: 1 } }, animationDuration: '1s' },
      scope: { '@scope to (.a)': { color: 'red' } },
    };
    const useStyles = makeStyles(styles);

    const serverRenderer = createServerRenderer();
    useStyles({ ...LTR, renderer: serverRenderer });
    flushToDocument(serverRenderer);

    const serverRenderedCSSRules = getInsertedCSSRules();
    expect(serverRenderedCSSRules.length).toBeGreaterThan(10);

    const clientRenderer = createDOMRenderer(document);
    rehydrateRendererCache(clientRenderer, document);
    useStyles({ ...LTR, renderer: clientRenderer });

    expect(getInsertedCSSRules()).toEqual(serverRenderedCSSRules);
  });

  test('caches every server-rendered rule verbatim', () => {
    const useStyles = makeStyles({
      root: {
        color: 'red',
        ':hover': { color: 'blue' },
        '@media (min-width: 100px)': { color: 'lime' },
        '@scope to (.a)': { color: 'red' },
      },
    });

    const serverRenderer = createServerRenderer();
    useStyles({ ...LTR, renderer: serverRenderer });

    const serverRules = Object.values(serverRenderer.stylesheets).flatMap(stylesheet => stylesheet.cssRules());
    flushToDocument(serverRenderer);

    const clientRenderer = createDOMRenderer(document);
    rehydrateRendererCache(clientRenderer, document);

    // Cache keys are the raw rule strings, so any parsing drift shows up as a missing key.
    expect(Object.keys(clientRenderer.insertionCache).sort()).toEqual([...serverRules].sort());
  });

  test('keeps computed styles correct after rehydration', () => {
    const useStyles = makeStyles({
      root: { color: 'red' },
      scoped: { '@scope to (.boundary)': { '& p': { color: 'blue' } } },
    });

    const serverRenderer = createServerRenderer();
    const serverClasses = useStyles({ ...LTR, renderer: serverRenderer });
    flushToDocument(serverRenderer);

    const clientRenderer = createDOMRenderer(document);
    rehydrateRendererCache(clientRenderer, document);
    useStyles({ ...LTR, renderer: clientRenderer });

    render(`
      <div class="${serverClasses.root}" data-testid="root">root</div>
      <div class="${serverClasses.scoped}">
        <p data-testid="scoped">scoped</p>
        <div class="boundary"><p data-testid="outside">past boundary</p></div>
      </div>
    `);

    expect(getColor(document.querySelector('[data-testid=root]')!)).toBe(COLORS.RED);
    expect(getColor(document.querySelector('[data-testid=scoped]')!)).toBe(COLORS.BLUE);
    expect(getColor(document.querySelector('[data-testid=outside]')!)).toBe(COLORS.BLACK);
  });
});
