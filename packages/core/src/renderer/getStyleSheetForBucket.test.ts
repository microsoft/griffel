import { describe, it, expect } from 'vitest';
import { DATA_BUCKET_ATTR, DATA_PRIORITY_ATTR, DATA_CONTAINER_ATTR } from '../constants.js';
import { createDOMRenderer } from './createDOMRenderer.js';
import {
  getStyleSheetForBucket,
  styleBucketOrdering,
  getStyleSheetKeyFromElement,
  isSameInsertionKey,
} from './getStyleSheetForBucket.js';

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
    getStyleSheetForBucket('x', target, null, renderer);
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
      [
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

  it('splits "@container" rules into per-condition sheets ordered by the comparator', () => {
    const target = createFakeDocument();
    // The default container comparator is lexicographic (same as media); a custom comparator can be
    // supplied (e.g. "compareCSSQueries" from "@griffel/sort-css-queries" for numeric min-width order).
    const containerQueryOrder = [
      'slot-container (min-width: 480px)',
      'slot-container (min-width: 720px)',
      'slot-container (min-width: 1024px)',
    ];
    const renderer = createDOMRenderer(undefined, {
      compareContainerQueries: (a, b) => containerQueryOrder.indexOf(a) - containerQueryOrder.indexOf(b),
    });

    getStyleSheetForBucket('d', target, null, renderer);

    // Inserted out of source order; should be ordered ascending by min-width regardless.
    getStyleSheetForBucket('x', target, null, renderer, { x: 'slot-container (min-width: 720px)' });
    getStyleSheetForBucket('x', target, null, renderer, { x: 'slot-container (min-width: 480px)' });
    // A larger breakpoint that sorts after 720px numerically (would sort before lexicographically).
    getStyleSheetForBucket('x', target, null, renderer, { x: 'slot-container (min-width: 1024px)' });

    expect(target.head.children).toMatchInlineSnapshot(`
      HTMLCollection [
        <style
          data-make-styles-bucket="d"
          data-priority="0"
        />,
        <style
          data-container="slot-container (min-width: 480px)"
          data-make-styles-bucket="x"
          data-priority="0"
        />,
        <style
          data-container="slot-container (min-width: 720px)"
          data-make-styles-bucket="x"
          data-priority="0"
        />,
        <style
          data-container="slot-container (min-width: 1024px)"
          data-make-styles-bucket="x"
          data-priority="0"
        />,
      ]
    `);
  });

  it('orders "@container" sheets with the media comparator when no container comparator is supplied', () => {
    const target = createFakeDocument();
    // "compareContainerQueries" defaults to whatever "compareMediaQueries" resolves to, so a custom
    // media comparator also drives container ordering unless overridden.
    const conditionOrder = ['slot-container (min-width: 480px)', 'slot-container (min-width: 720px)'];
    const renderer = createDOMRenderer(undefined, {
      compareMediaQueries: (a, b) => conditionOrder.indexOf(a) - conditionOrder.indexOf(b),
    });

    // Inserted out of source order; should follow the media comparator regardless.
    getStyleSheetForBucket('x', target, null, renderer, { x: 'slot-container (min-width: 720px)' });
    getStyleSheetForBucket('x', target, null, renderer, { x: 'slot-container (min-width: 480px)' });

    expect(target.head.children).toMatchInlineSnapshot(`
      HTMLCollection [
        <style
          data-container="slot-container (min-width: 480px)"
          data-make-styles-bucket="x"
          data-priority="0"
        />,
        <style
          data-container="slot-container (min-width: 720px)"
          data-make-styles-bucket="x"
          data-priority="0"
        />,
      ]
    `);
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

function createStyleElement(attributes: Partial<Record<string, string>> & { media?: string }): HTMLStyleElement {
  const element = document.createElement('style');

  for (const [name, value] of Object.entries(attributes)) {
    if (name === 'media') {
      element.media = value as string;
    } else {
      element.setAttribute(name, value as string);
    }
  }

  return element;
}

describe('getStyleSheetKeyFromElement', () => {
  it('defaults the priority to "0" when the attribute is missing', () => {
    const element = createStyleElement({ [DATA_BUCKET_ATTR]: 'd' });

    expect(getStyleSheetKeyFromElement(element)).toBe('d0');
  });

  it('includes the priority for regular buckets', () => {
    expect(
      getStyleSheetKeyFromElement(createStyleElement({ [DATA_BUCKET_ATTR]: 'd', [DATA_PRIORITY_ATTR]: '0' })),
    ).toBe('d0');
    expect(
      getStyleSheetKeyFromElement(createStyleElement({ [DATA_BUCKET_ATTR]: 'd', [DATA_PRIORITY_ATTR]: '1' })),
    ).toBe('d1');
  });

  it('does not include the condition for non "@media"/"@container" buckets', () => {
    const element = createStyleElement({ [DATA_BUCKET_ATTR]: 'c' });

    expect(getStyleSheetKeyFromElement(element)).toBe('c0');
  });

  it('includes the media query for the "m" bucket', () => {
    const element = createStyleElement({ [DATA_BUCKET_ATTR]: 'm', media: 'min-width: 1px' });

    expect(getStyleSheetKeyFromElement(element)).toBe('mmin-width: 1px0');
  });

  it('includes the container query for the "x" bucket', () => {
    const element = createStyleElement({ [DATA_BUCKET_ATTR]: 'x', [DATA_CONTAINER_ATTR]: 'min-width: 1px' });

    expect(getStyleSheetKeyFromElement(element)).toBe('xmin-width: 1px0');
  });
});

describe('isSameInsertionKey', () => {
  it('matches regular buckets by bucket name only', () => {
    const element = createStyleElement({ [DATA_BUCKET_ATTR]: 'd' });

    expect(isSameInsertionKey(element, 'd', {})).toBe(true);
  });

  it('matches the "m" bucket by its media query', () => {
    const element = createStyleElement({ [DATA_BUCKET_ATTR]: 'm', media: 'min-width: 480px' });

    expect(isSameInsertionKey(element, 'm', { m: 'min-width: 480px' })).toBe(true);
    expect(isSameInsertionKey(element, 'm', { m: 'min-width: 1px' })).toBe(false);
  });

  it('matches the "x" bucket by its container query', () => {
    const element = createStyleElement({ [DATA_BUCKET_ATTR]: 'x', [DATA_CONTAINER_ATTR]: 'min-width: 480px' });

    expect(isSameInsertionKey(element, 'x', { x: 'min-width: 480px' })).toBe(true);
    expect(isSameInsertionKey(element, 'x', { x: 'min-width: 1px' })).toBe(false);
  });

  it('does not match when the bucket names differ', () => {
    const dElement = createStyleElement({ [DATA_BUCKET_ATTR]: 'd' });
    const xElement = createStyleElement({ [DATA_BUCKET_ATTR]: 'x', [DATA_CONTAINER_ATTR]: 'min-width: 480px' });

    expect(isSameInsertionKey(dElement, 'm', { m: 'min-width: 480px' })).toBe(false);
    expect(isSameInsertionKey(xElement, 'm', { m: 'min-width: 480px' })).toBe(false);
  });
});
