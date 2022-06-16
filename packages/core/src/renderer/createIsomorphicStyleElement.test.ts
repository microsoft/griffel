import { createIsomorphicStyleElement } from './createIsomorphicStyleElement';

describe('createIsomorphicStyleElement', () => {
  it('should create a real style element in browser environment', () => {
    const styleElement = createIsomorphicStyleElement(document);
    expect((styleElement as HTMLStyleElement).tagName).toEqual('STYLE');
    expect(styleElement.__attributes).toBeUndefined();
    document.head.appendChild(styleElement as HTMLStyleElement);
    expect(styleElement.sheet.__cssRules).toBeUndefined();
  });
});
