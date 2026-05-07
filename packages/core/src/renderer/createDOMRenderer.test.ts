import { describe, it, expect, vi, beforeEach } from 'vitest';
import '../common/snapshotMatchers.js';
import type { CSSRulesByBucket } from '../types.js';
import { createDOMRenderer } from './createDOMRenderer.js';

describe('createDOMRenderer', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
  });

  it('should apply filter for css rules for multiple buckets', async () => {
    const mediaQueryFilter = vi.fn().mockImplementation(cssRule => {
      return !cssRule.startsWith('@media');
    });
    const renderer = createDOMRenderer(document, { unstable_filterCSSRule: mediaQueryFilter });

    const cssRules: CSSRulesByBucket = {
      t: ['@media only screen and (max-width: 600px) { .bar: { background-color: red; } }'],
      d: ['.foo { background-color: red; }'],
    };

    renderer.insertCSSRules(cssRules);

    await expect(renderer).toMatchFormattedInlineSnapshot(`
      "/** bucket "d" {"data-priority":"0"} **/
      .foo {
        background-color: red;
      }"
    `);
  });

  it('should apply filter for css rules within single bucket', async () => {
    const mediaQueryFilter = vi.fn().mockImplementation(cssRule => {
      return !cssRule.startsWith('@media');
    });
    const renderer = createDOMRenderer(document, { unstable_filterCSSRule: mediaQueryFilter });

    const cssRules: CSSRulesByBucket = {
      t: [
        '@media only screen and (max-width: 600px) { .bar: { background-color: red; } }',
        '.foo { background-color: red; }',
      ],
    };

    renderer.insertCSSRules(cssRules);
    await expect(renderer).toMatchFormattedInlineSnapshot(`
      "/** bucket "t" {"data-priority":"0"} **/
      .foo {
        background-color: red;
      }"
    `);
  });

  it('applies custom attributes to elements', () => {
    const renderer = createDOMRenderer(document, {
      styleElementAttributes: {
        'foo-bar': 'baz',
        nonce: 'random',
      },
    });

    // CSS rules are redundant for this test, but they are necessary as they trigger style nodes creation
    const cssRules: CSSRulesByBucket = {
      d: ['.foo { color: red; }'],
      h: ['.foo:hover { color: blue; }'],
    };

    renderer.insertCSSRules(cssRules);

    expect(document.head.children).toMatchInlineSnapshot(`
      HTMLCollection [
        <style
          data-make-styles-bucket="d"
          data-priority="0"
          foo-bar="baz"
          nonce="random"
        />,
        <style
          data-make-styles-bucket="h"
          data-priority="0"
          foo-bar="baz"
          nonce="random"
        />,
      ]
    `);
  });

  it('handles "insertionPoint"', () => {
    const elementA = document.createElement('style');
    const elementB = document.createElement('style');

    elementA.setAttribute('data-test', 'A');
    elementB.setAttribute('data-test', 'B');

    document.head.appendChild(elementA);
    document.head.appendChild(elementB);

    const renderer = createDOMRenderer(document, {
      insertionPoint: elementA,
    });

    // CSS rules are redundant for this test, but they are necessary as they trigger style nodes creation
    const cssRules: CSSRulesByBucket = {
      d: ['.foo { color: red; }'],
      h: ['.foo:hover { color: blue; }'],
    };

    renderer.insertCSSRules(cssRules);

    expect(document.head.children).toMatchInlineSnapshot(`
      HTMLCollection [
        <style
          data-test="A"
        />,
        <style
          data-make-styles-bucket="d"
          data-priority="0"
        />,
        <style
          data-make-styles-bucket="h"
          data-priority="0"
        />,
        <style
          data-test="B"
        />,
      ]
    `);
  });
});
