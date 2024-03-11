/*
 * @jest-environment node
 */

// 👆 this is intentionally to test in SSR like environment

import { createIsomorphicStyleSheet } from './createIsomorphicStyleSheet';

describe('createIsomorphicStyleElement - node', () => {
  it('should insert css rule', () => {
    const stylesheet = createIsomorphicStyleSheet(undefined, 'd', 0, {});
    stylesheet.insertRule(".foo { color: 'red' }");
    expect(stylesheet.cssRules()).toMatchInlineSnapshot(`
      Array [
        ".foo { color: 'red' }",
      ]
    `);
  });

  it('should set element attributes', () => {
    const stylesheet = createIsomorphicStyleSheet(undefined, 'd', 0, { 'data-foo': 'foo' });
    expect(stylesheet.elementAttributes).toMatchInlineSnapshot(`
      Object {
        "data-foo": "foo",
        "data-make-styles-bucket": "d",
        "data-priority": "0",
      }
    `);
  });
});
