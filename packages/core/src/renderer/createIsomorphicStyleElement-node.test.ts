/*
 * @jest-environment node
 */

// 👆 this is intentionally to test in SSR like environment

import { createIsomorphicStyleElement } from './createIsomorphicStyleElement';

describe('createIsomorphicStyleElement', () => {
  it('should a style element polyfill in SSR', () => {
    const styleElement = createIsomorphicStyleElement(undefined);
    expect(styleElement.__attributes).toBeDefined();
    expect(styleElement.sheet.__cssRules).toBeDefined();
  });

  it('should be able to set attributes', () => {
    const styleElement = createIsomorphicStyleElement(undefined);
    styleElement.setAttribute('data-make-styles-bucket', 'd');
    expect(styleElement.__attributes).toMatchInlineSnapshot(`
      Object {
        "data-make-styles-bucket": "d",
      }
    `);
  });

  it('should be able to insert rules', () => {
    const styleElement = createIsomorphicStyleElement(undefined);
    expect(styleElement.sheet).not.toBeUndefined();

    styleElement.sheet!.insertRule('.foo: { color: red; }');
    expect(styleElement.sheet.__cssRules).toMatchInlineSnapshot(`
      Array [
        ".foo: { color: red; }",
      ]
    `);
  });

  it('should be able to set media attribute', () => {
    const styleElement = createIsomorphicStyleElement(undefined);
    styleElement.media = '(max-width: 1px)';
    expect(styleElement.media).toMatchInlineSnapshot(`"(max-width: 1px)"`);
  });
});
