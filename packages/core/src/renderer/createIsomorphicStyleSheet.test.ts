import { createIsomorphicStyleSheet } from './createIsomorphicStyleSheet';

describe('createIsomorphicStyleElement', () => {
  it('should insert css rule', () => {
    const stylesheet = createIsomorphicStyleSheet(document.createElement('style'), 'd', 0, {});
    stylesheet.insertRule(".foo { color: 'red' }");
    expect(stylesheet.cssRules()).toMatchInlineSnapshot(`
      Array [
        ".foo { color: 'red' }",
      ]
    `);
  });

  it('should set element attributes', () => {
    const stylesheet = createIsomorphicStyleSheet(document.createElement('style'), 'd', 0, { 'data-foo': 'foo' });
    expect(stylesheet.elementAttributes).toMatchInlineSnapshot(`
      Object {
        "data-foo": "foo",
        "data-make-styles-bucket": "d",
        "data-priority": "0",
      }
    `);

    expect(stylesheet.element).toMatchInlineSnapshot(`
      <style
        data-foo="foo"
        data-make-styles-bucket="d"
        data-priority="0"
      />
    `);

    const actualElementAttributes = Array.from(stylesheet.element!.attributes).reduce((acc, attr) => {
      acc[attr.name] = attr.value;
      return acc;
    }, {} as Record<string, string>);

    expect(actualElementAttributes).toEqual(stylesheet.elementAttributes);
  });

  it('should create HTML style element', () => {
    const stylesheet = createIsomorphicStyleSheet(document.createElement('style'), 'd', 0, {});
    expect(stylesheet.element).not.toBeUndefined();
    expect(stylesheet.element).toMatchInlineSnapshot(`
      <style
        data-make-styles-bucket="d"
        data-priority="0"
      />
    `);
  });
});
