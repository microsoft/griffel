import { DATA_BUCKET_ATTR } from '../constants';
import { createDOMRenderer } from './createDOMRenderer';
import { getStyleSheetForBucket, styleBucketOrdering } from './getStyleSheetForBucket';

function createFakeDocument(): Document {
  const doc = document.implementation.createDocument('http://www.w3.org/1999/xhtml', 'html', null);
  doc.documentElement.appendChild(document.createElementNS('http://www.w3.org/1999/xhtml', 'head'));

  return doc;
}

describe('getStyleSheetForBucket', () => {
  it('creates elements order', () => {
    const target = createFakeDocument();
    const renderer = createDOMRenderer();

    getStyleSheetForBucket('l', target, null, renderer);
    getStyleSheetForBucket('r', target, null, renderer);
    getStyleSheetForBucket('a', target, null, renderer);
    getStyleSheetForBucket('d', target, null, renderer);

    expect(target.head.children).toMatchInlineSnapshot(`
      HTMLCollection [
        <style
          data-make-styles-bucket="r"
          data-priority="0"
        />,
        <style
          data-make-styles-bucket="d"
          data-priority="0"
        />,
        <style
          data-make-styles-bucket="l"
          data-priority="0"
        />,
        <style
          data-make-styles-bucket="a"
          data-priority="0"
        />,
      ]
    `);
  });

  it('creates elements order & respects priority', () => {
    const target = createFakeDocument();
    const renderer = createDOMRenderer();

    getStyleSheetForBucket('a', target, null, renderer, { p: -1 });
    getStyleSheetForBucket('a', target, null, renderer);
    getStyleSheetForBucket('a', target, null, renderer, { p: -2 });
    getStyleSheetForBucket('d', target, null, renderer);
    getStyleSheetForBucket('d', target, null, renderer, { p: -1 });
    getStyleSheetForBucket('d', target, null, renderer, { p: -2 });

    expect(target.head.children).toMatchInlineSnapshot(`
      HTMLCollection [
        <style
          data-make-styles-bucket="d"
          data-priority="-2"
        />,
        <style
          data-make-styles-bucket="d"
          data-priority="-1"
        />,
        <style
          data-make-styles-bucket="d"
          data-priority="0"
        />,
        <style
          data-make-styles-bucket="a"
          data-priority="-2"
        />,
        <style
          data-make-styles-bucket="a"
          data-priority="-1"
        />,
        <style
          data-make-styles-bucket="a"
          data-priority="0"
        />,
      ]
    `);
  });

  it('sets "data-make-styles-bucket" attribute in order', () => {
    const target = createFakeDocument();
    const renderer = createDOMRenderer();

    getStyleSheetForBucket('r', target, null, renderer);
    getStyleSheetForBucket('l', target, null, renderer);
    getStyleSheetForBucket('d', target, null, renderer);
    getStyleSheetForBucket('v', target, null, renderer);
    getStyleSheetForBucket('a', target, null, renderer);
    getStyleSheetForBucket('c', target, null, renderer);
    getStyleSheetForBucket('i', target, null, renderer);
    getStyleSheetForBucket('h', target, null, renderer);
    getStyleSheetForBucket('m', target, null, renderer);
    getStyleSheetForBucket('w', target, null, renderer);
    getStyleSheetForBucket('t', target, null, renderer);
    getStyleSheetForBucket('k', target, null, renderer);
    getStyleSheetForBucket('f', target, null, renderer);
    getStyleSheetForBucket('s', target, null, renderer);

    const styleElements = target.head.querySelectorAll(`[${DATA_BUCKET_ATTR}]`);
    const styleElementOrder = Array.from(styleElements).map(styleElement =>
      styleElement.getAttribute(DATA_BUCKET_ATTR),
    );
    expect(styleElementOrder).toEqual(styleBucketOrdering);
  });

  it('finds a position in media queries', () => {
    const target = createFakeDocument();
    const renderer = createDOMRenderer();

    getStyleSheetForBucket('d', target, null, renderer);
    getStyleSheetForBucket('t', target, null, renderer);
    getStyleSheetForBucket('c', target, null, renderer);

    getStyleSheetForBucket('m', target, null, renderer, { m: 'screen and (prefers-reduced-motion: reduce)' });
    getStyleSheetForBucket('m', target, null, renderer, { m: '(forced-colors: active)' });

    expect(target.head.children).toMatchInlineSnapshot(`
      HTMLCollection [
        <style
          data-make-styles-bucket="d"
          data-priority="0"
        />,
        <style
          data-make-styles-bucket="t"
          data-priority="0"
        />,
        <style
          data-make-styles-bucket="m"
          data-priority="0"
          media="(forced-colors: active)"
        />,
        <style
          data-make-styles-bucket="m"
          data-priority="0"
          media="screen and (prefers-reduced-motion: reduce)"
        />,
        <style
          data-make-styles-bucket="c"
          data-priority="0"
        />,
      ]
    `);
  });

  it('sets "data-make-styles-bucket" attribute in order with media queries', () => {
    const target = createFakeDocument();
    const mediaQueryOrder = ['(max-width: 1px)', '(max-width: 2px)', '(max-width: 3px)', '(max-width: 4px)'];
    const renderer = createDOMRenderer(target, {
      compareMediaQueries(a, b) {
        return mediaQueryOrder.indexOf(a) - mediaQueryOrder.indexOf(b);
      },
    });

    getStyleSheetForBucket('l', target, null, renderer);
    getStyleSheetForBucket('d', target, null, renderer);
    getStyleSheetForBucket('v', target, null, renderer);

    getStyleSheetForBucket('m', target, null, renderer, { m: '(max-width: 3px)' });

    getStyleSheetForBucket('a', target, null, renderer);
    getStyleSheetForBucket('i', target, null, renderer);

    getStyleSheetForBucket('m', target, null, renderer, { m: '(max-width: 1px)' });

    getStyleSheetForBucket('h', target, null, renderer);

    getStyleSheetForBucket('m', target, null, renderer, { m: '(max-width: 4px)' });

    getStyleSheetForBucket('w', target, null, renderer);
    getStyleSheetForBucket('t', target, null, renderer);
    getStyleSheetForBucket('k', target, null, renderer);
    getStyleSheetForBucket('f', target, null, renderer);

    getStyleSheetForBucket('m', target, null, renderer, { m: '(max-width: 2px)' });

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

  it('handles "insertionPoint"', () => {
    const target = createFakeDocument();
    const renderer = createDOMRenderer();

    const elementA = target.createElement('style');
    const elementB = target.createElement('style');
    const elementC = target.createElement('style');

    elementA.setAttribute('data-test', 'A');
    elementB.setAttribute('data-test', 'B');
    elementC.setAttribute('data-test', 'C');

    target.head.appendChild(elementA);
    target.head.appendChild(elementB);
    target.head.appendChild(elementC);

    getStyleSheetForBucket('r', target, elementB, renderer);
    getStyleSheetForBucket('d', target, elementB, renderer);

    expect(target.head.children).toMatchInlineSnapshot(`
      HTMLCollection [
        <style
          data-test="A"
        />,
        <style
          data-test="B"
        />,
        <style
          data-make-styles-bucket="r"
          data-priority="0"
        />,
        <style
          data-make-styles-bucket="d"
          data-priority="0"
        />,
        <style
          data-test="C"
        />,
      ]
    `);
  });
});
