import { injectDevTools } from './injectDevTools';

describe('injectDevTools', () => {
  it('adds __GRIFFEL_DEVTOOLS__ to document.defaultView', () => {
    const document = { defaultView: {} };
    injectDevTools(document as Document);
    expect(document.defaultView).toHaveProperty('__GRIFFEL_DEVTOOLS__');

    const descriptor = Object.getOwnPropertyDescriptor(document.defaultView, '__GRIFFEL_DEVTOOLS__');
    expect(descriptor?.configurable).toBe(false);
    expect(descriptor?.enumerable).toBe(false);
  });

  it('adds getInfo function to __GRIFFEL_DEVTOOLS__', () => {
    const document = { defaultView: {} };
    injectDevTools(document as Document);
    expect((document.defaultView as Window)['__GRIFFEL_DEVTOOLS__']?.getInfo).toBeDefined();
  });
});
