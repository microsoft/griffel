// Resolves the cascade in a real browser for the setup Fluent UI plans to ship: one layer per style bucket, each
// with a "components" sublayer (CSS Modules) followed by a "griffel" sublayer (all Griffel output), and an app layer
// declared after Fluent's one.

import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { userEvent } from 'vitest/browser';
import { createDOMRenderer, makeStyles, mergeClasses } from '../index.js';
import type { GriffelCascadeLayerFn, GriffelRenderer } from '../index.js';
import { COLORS, commands, getColor, render, resetBrowserTestState } from '../common/browserHelpers.js';
import { getCascadeLayerOrder } from './getCascadeLayerOrder.js';
import { styleBucketOrdering } from './getStyleSheetForBucket.js';
import { rehydrateRendererCache } from './rehydrateRendererCache.js';

const cascadeLayer: GriffelCascadeLayerFn = bucketName => `fluentui.${bucketName}.griffel`;

const LAYER_ORDER_CSS = [
  '@layer reset, fluentui, application;',
  getCascadeLayerOrder(bucketName => [`fluentui.${bucketName}.components`, `fluentui.${bucketName}.griffel`]),
].join('\n');

// 👇 stands in for Fluent's CSS Modules; selectors are deliberately more specific than Griffel's atomic classes to
//    show that layers, not specificity, decide the winner
const COMPONENTS_CSS = `
  @layer fluentui.d.components { .btn.btn.btn { color: red; background-color: white; } }
  @layer fluentui.h.components { .btn.btn.btn:hover { color: orange; } }
  @layer fluentui.a.components { .btn.btn.btn:active { color: yellow; } }
  @layer fluentui.m.components { @media (min-width: 1px) { .btn.btn.btn { background-color: lightgreen; } } }
`;

const APPLICATION_CSS = `@layer application { .app-override { background-color: cyan; } }`;

function addStyleElement(css: string, id: string): void {
  const styleElement = document.createElement('style');

  styleElement.id = id;
  styleElement.textContent = css;
  document.head.appendChild(styleElement);
}

function getBackgroundColor(el: Element): string {
  return getComputedStyle(el).backgroundColor;
}

beforeEach(() => {
  resetBrowserTestState();
  addStyleElement(LAYER_ORDER_CSS, 'layer-order');
});

afterEach(() => {
  document.head.querySelectorAll('style[id]').forEach(el => el.remove());
});

describe('cascadeLayer', () => {
  test('app overrides beat base rules of components, but lose to their state rules', async () => {
    addStyleElement(COMPONENTS_CSS, 'components');

    const renderer = createDOMRenderer(document, { cascadeLayer });
    const useStyles = makeStyles({ override: { color: 'blue' } });
    const classes = useStyles({ dir: 'ltr', renderer });

    render(`<button class="${mergeClasses('btn', classes.override)}">button</button>`);
    const button = document.querySelector('button')!;

    // default: app override (fluentui.d.griffel) beats Fluent base (fluentui.d.components)
    expect(getColor(button)).toBe(COLORS.BLUE);

    // hover: Fluent hover (fluentui.h.components) beats app override from a lower bucket
    await userEvent.hover(button);
    expect(getColor(button)).toBe(COLORS.ORANGE);

    // active: Fluent active beats both
    await commands.mouseDown();
    expect(getColor(button)).toBe(COLORS.YELLOW);
    await commands.mouseUp();
    await userEvent.unhover(button);

    expect(getColor(button)).toBe(COLORS.BLUE);
  });

  test('media rules of components keep winning over app overrides from lower buckets', () => {
    addStyleElement(COMPONENTS_CSS, 'components');

    const renderer = createDOMRenderer(document, { cascadeLayer });
    const classes = makeStyles({ override: { backgroundColor: 'blue' } })({ dir: 'ltr', renderer });

    render(`<button class="${mergeClasses('btn', classes.override)}">button</button>`);

    expect(getBackgroundColor(document.querySelector('button')!)).toBe(COLORS.LIGHT_GREEN);
  });

  test('app layers declared after Griffel layers win without !important', () => {
    addStyleElement(APPLICATION_CSS, 'application');

    const renderer = createDOMRenderer(document, { cascadeLayer });
    const classes = makeStyles({
      root: {
        backgroundColor: 'red',
        ':hover': { backgroundColor: 'red' },
        '@media (min-width: 1px)': { backgroundColor: 'red' },
      },
    })({ dir: 'ltr', renderer });

    render(`<div class="${classes.root} app-override">div</div>`);

    expect(getBackgroundColor(document.querySelector('div')!)).toBe(COLORS.CYAN);
  });

  test('keeps the bucket order between Griffel rules', async () => {
    const renderer = createDOMRenderer(document, { cascadeLayer });
    const classes = makeStyles({
      root: { color: 'red', ':hover': { color: 'blue' }, ':active': { color: 'lime' } },
    })({ dir: 'ltr', renderer });

    render(`<button class="${classes.root}">button</button>`);
    const button = document.querySelector('button')!;

    expect(getColor(button)).toBe(COLORS.RED);
    await userEvent.hover(button);
    expect(getColor(button)).toBe(COLORS.BLUE);
    await userEvent.unhover(button);
  });

  test('inserts rules into a single layer block per style element', () => {
    const renderer = createDOMRenderer(document, { cascadeLayer });
    makeStyles({ a: { color: 'red' }, b: { color: 'blue', '@layer author': { color: 'lime' } } })({
      dir: 'ltr',
      renderer,
    });

    const styleElements = Array.from(document.head.querySelectorAll<HTMLStyleElement>('[data-make-styles-bucket]'));
    const sheets = styleElements.map(el => ({
      bucket: el.dataset['makeStylesBucket'],
      rules: Array.from(el.sheet!.cssRules).map(rule => ({
        layer: rule instanceof CSSLayerBlockRule ? rule.name : null,
        count: rule instanceof CSSLayerBlockRule ? rule.cssRules.length : 1,
      })),
    }));

    expect(sheets).toEqual([
      { bucket: 'd', rules: [{ layer: 'fluentui.d.griffel', count: 2 }] },
      // 👇 rules that name a layer are not nested
      { bucket: 't', rules: [{ layer: 'author', count: 1 }] },
    ]);
  });

  describe('SSR', () => {
    function createServerRenderer(): GriffelRenderer {
      return createDOMRenderer(null as unknown as undefined, { cascadeLayer });
    }

    // Mirrors "renderToStyleElements()" from "@griffel/react"
    function flushToDocument(renderer: GriffelRenderer): void {
      Object.values(renderer.stylesheets)
        .sort((a, b) => styleBucketOrdering.indexOf(a.bucketName) - styleBucketOrdering.indexOf(b.bucketName))
        .forEach(stylesheet => {
          const styleElement = document.createElement('style');

          for (const attribute of Object.keys(stylesheet.elementAttributes)) {
            styleElement.setAttribute(attribute, stylesheet.elementAttributes[attribute]);
          }

          styleElement.textContent = stylesheet.cssRules().join('');
          document.head.appendChild(styleElement);
        });
    }

    function getInsertedCSSRules(): string[] {
      return Array.from(document.head.querySelectorAll<HTMLStyleElement>('style[data-make-styles-bucket]')).flatMap(
        styleElement =>
          Array.from(styleElement.sheet!.cssRules).flatMap(rule =>
            rule instanceof CSSLayerBlockRule
              ? Array.from(rule.cssRules).map(nestedRule => `${rule.name} ${nestedRule.cssText}`)
              : [rule.cssText],
          ),
      );
    }

    const useStyles = makeStyles({
      root: {
        color: 'red',
        padding: '4px',
        ':hover': { color: 'blue' },
        ':focus-visible': { color: 'lime' },
        '@media (min-width: 100px)': { color: 'red' },
        '@media (forced-colors: active)': { color: 'CanvasText' },
        '@supports (display: grid)': { color: 'blue' },
        '@container slot (min-width: 480px)': { color: 'red' },
        '@scope to (.a)': { color: 'red' },
        '@layer author': { color: 'teal' },
        animationName: { from: { opacity: 0 }, to: { opacity: 1 } },
      },
    });

    test('does not re-insert server-rendered rules', () => {
      const serverRenderer = createServerRenderer();
      useStyles({ dir: 'ltr', renderer: serverRenderer });
      flushToDocument(serverRenderer);

      const serverRenderedCSSRules = getInsertedCSSRules();
      expect(serverRenderedCSSRules.length).toBeGreaterThan(10);

      const clientRenderer = createDOMRenderer(document, { cascadeLayer });
      rehydrateRendererCache(clientRenderer, document);
      useStyles({ dir: 'ltr', renderer: clientRenderer });

      expect(getInsertedCSSRules()).toEqual(serverRenderedCSSRules);
      expect(Object.keys(clientRenderer.insertionCache).sort()).toEqual(
        Object.keys(serverRenderer.insertionCache).sort(),
      );
    });

    test('inserts new rules into server-rendered layer blocks', () => {
      const serverRenderer = createServerRenderer();
      useStyles({ dir: 'ltr', renderer: serverRenderer });
      flushToDocument(serverRenderer);

      const clientRenderer = createDOMRenderer(document, { cascadeLayer });
      rehydrateRendererCache(clientRenderer, document);

      const classes = makeStyles({ root: { backgroundColor: 'cyan' } })({ dir: 'ltr', renderer: clientRenderer });
      const defaultBucket = document.head.querySelector<HTMLStyleElement>('[data-make-styles-bucket="d"]')!;

      expect(defaultBucket.sheet!.cssRules).toHaveLength(1);
      expect((defaultBucket.sheet!.cssRules[0] as CSSLayerBlockRule).cssRules).toHaveLength(4);

      render(`<div class="${classes.root}">div</div>`);
      expect(getBackgroundColor(document.querySelector('div')!)).toBe(COLORS.CYAN);
    });
  });
});
