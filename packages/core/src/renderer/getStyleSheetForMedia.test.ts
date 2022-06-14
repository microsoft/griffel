import { getStyleSheetForMedia } from './getStyleSheetForMedia';
import { createDOMRenderer } from './createDOMRenderer';

function createFakeDocument(): Document {
  const doc = document.implementation.createDocument('http://www.w3.org/1999/xhtml', 'html', null);
  doc.documentElement.appendChild(document.createElementNS('http://www.w3.org/1999/xhtml', 'head'));

  return doc;
}

describe('getStyleSheetForMedia', () => {
  it('sets "data-make-styles-bucket" attribute', () => {
    const target = createFakeDocument();
    const mediaQueryOrder = [
      'screen and (max-width: 1px)',
      'screen and (max-width: 2px)',
      'screen and (max-width: 3px)',
      'screen and (max-width: 4px)',
    ];

    const compareMediaQuery = (a: string, b: string) => {
      return mediaQueryOrder.indexOf(a) - mediaQueryOrder.indexOf(b);
    };
    const renderer = createDOMRenderer(document, { compareMediaQuery });

    getStyleSheetForMedia('screen and (max-width: 3px)', target, renderer);
    getStyleSheetForMedia('screen and (max-width: 1px)', target, renderer);
    getStyleSheetForMedia('screen and (max-width: 4px)', target, renderer);
    getStyleSheetForMedia('screen and (max-width: 2px)', target, renderer);

    const mediaElements = target.head.querySelectorAll('[data-make-styles-media]');
    const actualMediaQueryOrder = Array.from(mediaElements).map(mediaElement =>
      mediaElement.getAttribute('data-make-styles-media'),
    );
    expect(actualMediaQueryOrder).toEqual(mediaQueryOrder);
  });
});
