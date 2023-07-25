import { insertionFactory } from './insertionFactory';
import type { GriffelRenderer } from './types';

describe('insertionFactory', () => {
  it('should return a function', () => {
    expect(insertionFactory()).toBeInstanceOf(Function);
  });

  it('inserts CSS rules only once per renderer', () => {
    const rendererA: Partial<GriffelRenderer> = { id: 'a', insertCSSRules: jest.fn() };
    const rendererB: Partial<GriffelRenderer> = { id: 'b', insertCSSRules: jest.fn() };

    const insertStyles = insertionFactory();

    insertStyles(rendererA as GriffelRenderer, { d: ['a'] });
    insertStyles(rendererA as GriffelRenderer, { d: ['a'] });

    expect(rendererA.insertCSSRules).toHaveBeenCalledTimes(1);

    insertStyles(rendererB as GriffelRenderer, { d: ['a'] });
    insertStyles(rendererB as GriffelRenderer, { d: ['a'] });

    expect(rendererB.insertCSSRules).toHaveBeenCalledTimes(1);
  });
});
