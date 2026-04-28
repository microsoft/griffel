import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DATA_BUCKET_ATTR, DATA_PRIORITY_ATTR } from '../constants.js';
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
});
