import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DATA_BUCKET_ATTR, DATA_CONTAINER_ATTR, DATA_PRIORITY_ATTR } from '../constants.js';
import type { GriffelRenderer } from '../types.js';
import { createDOMRenderer } from './createDOMRenderer.js';
import { rehydrateRendererCache } from './rehydrateRendererCache.js';

describe('rehydrateRendererCache', () => {
  let renderer: GriffelRenderer;

  beforeEach(() => {
    process.env.NODE_ENV = 'production';
    renderer = createDOMRenderer(document);
  });

  afterEach(() => {
    document.head.innerHTML = '';
  });

  it('should rehydrate renderer cache', () => {
    const styleElement = document.createElement('style');

    styleElement.setAttribute(DATA_BUCKET_ATTR, 'd');
    styleElement.setAttribute(DATA_PRIORITY_ATTR, '0');

    document.head.appendChild(styleElement);
    styleElement.textContent = '.foo { color: red; }';

    rehydrateRendererCache(renderer, document);

    expect(renderer.insertionCache).toMatchInlineSnapshot(`
      {
        ".foo { color: red; }": "d",
      }
    `);
  });

  it('should rehydrate @scope rules in the d bucket', () => {
    const styleElement = document.createElement('style');

    styleElement.setAttribute(DATA_BUCKET_ATTR, 'd');
    styleElement.setAttribute(DATA_PRIORITY_ATTR, '0');

    document.head.appendChild(styleElement);
    styleElement.textContent = '@scope (.f1ewl1kl) to (.boundary) { :scope .child{color:red;} }';

    rehydrateRendererCache(renderer, document);

    expect(renderer.insertionCache).toMatchInlineSnapshot(`
      {
        "@scope (.f1ewl1kl) to (.boundary) { :scope .child{color:red;} }": "d",
      }
    `);
  });

  it('should rehydrate @scope rules in the h bucket', () => {
    const styleElement = document.createElement('style');

    styleElement.setAttribute(DATA_BUCKET_ATTR, 'h');
    styleElement.setAttribute(DATA_PRIORITY_ATTR, '0');

    document.head.appendChild(styleElement);
    styleElement.textContent = '@scope (.f1ewl1kl) to (.boundary) { :scope:hover{color:cyan;} }';

    rehydrateRendererCache(renderer, document);

    expect(renderer.insertionCache).toMatchInlineSnapshot(`
      {
        "@scope (.f1ewl1kl) to (.boundary) { :scope:hover{color:cyan;} }": "h",
      }
    `);
  });

  it('should rehydrate @scope rules with boundary selector', () => {
    const styleElement = document.createElement('style');

    styleElement.setAttribute(DATA_BUCKET_ATTR, 'd');
    styleElement.setAttribute(DATA_PRIORITY_ATTR, '0');

    document.head.appendChild(styleElement);
    styleElement.textContent = '@scope (.f1ewl1kl) to (.boundary) { :scope .child{color:red;} }';

    rehydrateRendererCache(renderer, document);

    expect(renderer.insertionCache).toMatchInlineSnapshot(`
      {
        "@scope (.f1ewl1kl) to (.boundary) { :scope .child{color:red;} }": "d",
      }
    `);
  });

  it('should rehydrate @container rules in the x bucket', () => {
    const styleElement = document.createElement('style');

    styleElement.setAttribute(DATA_BUCKET_ATTR, 'x');
    styleElement.setAttribute(DATA_PRIORITY_ATTR, '0');
    styleElement.setAttribute(DATA_CONTAINER_ATTR, 'slot-container (min-width: 480px)');

    document.head.appendChild(styleElement);
    styleElement.textContent = '@container slot-container (min-width: 480px) { .foo{color:red;} }';

    rehydrateRendererCache(renderer, document);

    expect(renderer.insertionCache).toMatchInlineSnapshot(`
      {
        "@container slot-container (min-width: 480px) { .foo{color:red;} }": "x",
      }
    `);
  });

  it('rehydrates legacy "c" bucket @container rules and does not re-insert them under "x"', () => {
    // Older Griffel versions emitted "@container" rules under bucket "c" (no "data-container"
    // attribute, no sorting metadata). A newer client — which now routes container rules to the "x"
    // bucket — must still recognize that legacy SSR output so it does not insert a duplicate rule.
    const cssRule = '@container slot-container (min-width: 480px) { .foo{color:red;} }';

    const styleElement = document.createElement('style');
    styleElement.setAttribute(DATA_BUCKET_ATTR, 'c');
    styleElement.setAttribute(DATA_PRIORITY_ATTR, '0');

    document.head.appendChild(styleElement);
    styleElement.textContent = cssRule;

    rehydrateRendererCache(renderer, document);

    // The legacy rule is cached under its original "c" bucket.
    expect(renderer.insertionCache[cssRule]).toBe('c');

    // A client re-render routes the same rule to the new "x" bucket. The cache hit must skip
    // insertion: "insertionCache" is only overwritten when a rule is actually inserted, so the
    // cached bucket staying "c" proves the "x" insertion was deduplicated (no duplicate sheet).
    renderer.insertCSSRules({ x: [[cssRule, { x: 'slot-container (min-width: 480px)' }]] });

    expect(renderer.insertionCache[cssRule]).toBe('c');
  });

  it('should create isomorphic stylesheet', () => {
    const styleElement = document.createElement('style');
    styleElement.setAttribute(DATA_BUCKET_ATTR, 'd');
    styleElement.setAttribute(DATA_PRIORITY_ATTR, '-1');

    document.head.appendChild(styleElement);
    rehydrateRendererCache(renderer, document);

    expect(Object.keys(renderer.stylesheets)).toEqual(['d-1']);
    expect(renderer.stylesheets['d-1'].bucketName).toMatchInlineSnapshot(`"d"`);
    expect(renderer.stylesheets['d-1'].elementAttributes).toMatchInlineSnapshot(`
      {
        "data-make-styles-bucket": "d",
        "data-priority": "-1",
      }
    `);
  });

  it('warns in development when the same rule is rehydrated from multiple <style> elements', () => {
    process.env.NODE_ENV = 'development';
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    // The same rule emitted into two server-rendered <style> elements is the signature of
    // styles being flushed into the HTML more than once — e.g. a Next.js App Router setup that
    // calls renderToStyleElements() on every flush without clearing the renderer in between.
    for (let i = 0; i < 2; i++) {
      const styleElement = document.createElement('style');
      styleElement.setAttribute(DATA_BUCKET_ATTR, 'd');
      styleElement.setAttribute(DATA_PRIORITY_ATTR, '0');
      styleElement.textContent = '.foo { color: red; }';
      document.head.appendChild(styleElement);
    }

    rehydrateRendererCache(renderer, document);

    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(consoleError.mock.calls[0][0]).toContain('duplicate CSS rule');

    consoleError.mockRestore();
  });

  it('does not warn when buckets repeat with different rules (correct streamed delta)', () => {
    process.env.NODE_ENV = 'development';
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    // Same bucket + priority across two elements, but different rules — this is what correct
    // per-flush delta flushing looks like, and it must NOT warn.
    const first = document.createElement('style');
    first.setAttribute(DATA_BUCKET_ATTR, 'd');
    first.setAttribute(DATA_PRIORITY_ATTR, '0');
    first.textContent = '.foo { color: red; }';
    document.head.appendChild(first);

    const second = document.createElement('style');
    second.setAttribute(DATA_BUCKET_ATTR, 'd');
    second.setAttribute(DATA_PRIORITY_ATTR, '0');
    second.textContent = '.bar { color: blue; }';
    document.head.appendChild(second);

    rehydrateRendererCache(renderer, document);

    expect(consoleError).not.toHaveBeenCalled();

    consoleError.mockRestore();
  });
});
