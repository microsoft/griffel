import type { GriffelRenderer } from '@griffel/core';

import { insertionFactory } from './insertionFactory';
import { useInsertionEffect as _useInsertionEffect } from './useInsertionEffect';
import type * as React from 'react';

jest.mock('./useInsertionEffect', () => ({
  useInsertionEffect: jest.fn().mockImplementation(fn => fn()),
}));

const useInsertionEffect = _useInsertionEffect as jest.MockedFunction<typeof React.useInsertionEffect>;

describe('canUseDOM', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses "useInsertionEffect" when available', () => {
    const renderer: Partial<GriffelRenderer> = { insertCSSRules: jest.fn() };
    const insertStyles = insertionFactory();

    insertStyles(renderer as GriffelRenderer, { d: ['a'] });

    expect(useInsertionEffect).toHaveBeenCalledTimes(1);
    expect(renderer.insertCSSRules).toHaveBeenCalledTimes(1);
  });
});
