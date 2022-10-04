import { getStyleSheetForBucket, styleBucketOrdering } from './getStyleSheetForBucket';
import { createDOMRenderer } from './createDOMRenderer';
import { DATA_BUCKET_ATTR } from '../constants';

function createFakeDocument(): Document {
  const doc = document.implementation.createDocument('http://www.w3.org/1999/xhtml', 'html', null);
  doc.documentElement.appendChild(document.createElementNS('http://www.w3.org/1999/xhtml', 'head'));

  return doc;
}

describe('getStyleSheetForBucket', () => {
  it('sets "data-make-styles-bucket" attribute in order', () => {
    const target = createFakeDocument();
    const renderer = createDOMRenderer();

    getStyleSheetForBucket('r', target, renderer);
    getStyleSheetForBucket('l', target, renderer);
    getStyleSheetForBucket('d', target, renderer);
    getStyleSheetForBucket('v', target, renderer);
    getStyleSheetForBucket('a', target, renderer);
    getStyleSheetForBucket('i', target, renderer);
    getStyleSheetForBucket('h', target, renderer);
    getStyleSheetForBucket('m', target, renderer);
    getStyleSheetForBucket('w', target, renderer);
    getStyleSheetForBucket('t', target, renderer);
    getStyleSheetForBucket('k', target, renderer);
    getStyleSheetForBucket('f', target, renderer);

    const styleElements = target.head.querySelectorAll(`[${DATA_BUCKET_ATTR}]`);
    const styleElementOrder = Array.from(styleElements).map(styleElement =>
      styleElement.getAttribute(DATA_BUCKET_ATTR),
    );
    expect(styleElementOrder).toEqual(styleBucketOrdering);
  });

  it('sets "data-make-styles-bucket" attribute in order with media queries', () => {
    const target = createFakeDocument();
    const mediaQueryOrder = ['(max-width: 1px)', '(max-width: 2px)', '(max-width: 3px)', '(max-width: 4px)'];
    const renderer = createDOMRenderer(target, {
      compareMediaQueries(a, b) {
        return mediaQueryOrder.indexOf(a) - mediaQueryOrder.indexOf(b);
      },
    });

    getStyleSheetForBucket('l', target, renderer);
    getStyleSheetForBucket('d', target, renderer);
    getStyleSheetForBucket('v', target, renderer);

    getStyleSheetForBucket('m', target, renderer, {}, { m: '(max-width: 3px)' });

    getStyleSheetForBucket('a', target, renderer);
    getStyleSheetForBucket('i', target, renderer);

    getStyleSheetForBucket('m', target, renderer, {}, { m: '(max-width: 1px)' });

    getStyleSheetForBucket('h', target, renderer);

    getStyleSheetForBucket('m', target, renderer, {}, { m: '(max-width: 4px)' });

    getStyleSheetForBucket('w', target, renderer);
    getStyleSheetForBucket('t', target, renderer);
    getStyleSheetForBucket('k', target, renderer);
    getStyleSheetForBucket('f', target, renderer);

    getStyleSheetForBucket('m', target, renderer, {}, { m: '(max-width: 2px)' });

    const styleElements = target.head.querySelectorAll(`[${DATA_BUCKET_ATTR}]`);
    const styleElementOrder = Array.from(styleElements).map(styleElement =>
      styleElement.getAttribute(DATA_BUCKET_ATTR),
    );
    expect(styleElementOrder).toMatchInlineSnapshot(`
      Array [
        "d",
        "l",
        "v",
        "w",
        "f",
        "i",
        "h",
        "a",
        "k",
        "t",
        "m",
        "m",
        "m",
        "m",
      ]
    `);

    const actualMediaQueryOrder = Array.from(styleElements)
      .map(styleElement => styleElement.getAttribute('media'))
      .filter(Boolean);
    expect(actualMediaQueryOrder).toEqual(mediaQueryOrder);
  });
});
