import { DATA_BUCKET_ATTR, DATA_PRIORITY_ATTR } from '../constants';
import type { GriffelRenderer } from '../types';
import { createDOMRenderer } from './createDOMRenderer';
import { rehydrateRendererCache } from './rehydrateRendererCache';

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
      Object {
        ".foo { color: red; }": "d",
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
      Object {
        "data-make-styles-bucket": "d",
        "data-priority": "-1",
      }
    `);
  });
});
