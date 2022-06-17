import { DATA_BUCKET_ATTR } from '../constants';
import { createDOMRenderer } from './createDOMRenderer';
import { rehydrateRendererCache } from './rehydrateRendererCache';

describe('rehydrateRendererCache', () => {
  it('should rehydrate renderer cache', () => {
    const renderer = createDOMRenderer(document);
    const styleElement = document.createElement('style');
    styleElement.setAttribute(DATA_BUCKET_ATTR, 'd');
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
    const renderer = createDOMRenderer(document);
    const styleElement = document.createElement('style');
    document.head.appendChild(styleElement);
    styleElement.setAttribute(DATA_BUCKET_ATTR, 'd');
    styleElement.textContent = ".foo { color: 'red' }";
    rehydrateRendererCache(renderer, document);

    expect(renderer.stylesheets['d']).not.toBeUndefined();
    expect(renderer.stylesheets['d']?.bucketName).toMatchInlineSnapshot(`"d"`);
    expect(renderer.stylesheets['d']?.elementAttributes).toMatchInlineSnapshot(`
      Object {
        "data-make-styles-bucket": "d",
      }
    `);
  });
});
