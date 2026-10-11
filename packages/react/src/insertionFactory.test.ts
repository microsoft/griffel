import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import type { GriffelRenderer } from '@griffel/core';

import { insertionFactory } from './insertionFactory.js';
import { useInsertionEffect as _useInsertionEffect } from './useInsertionEffect.js';
import type * as React from 'react';

vi.mock('./useInsertionEffect', () => ({
  useInsertionEffect: vi.fn().mockImplementation(fn => fn()),
}));

const useInsertionEffect = _useInsertionEffect as Mock<typeof React.useInsertionEffect>;

describe('canUseDOM', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses "useInsertionEffect" when available', () => {
    const renderer: Partial<GriffelRenderer> = { insertCSSRules: vi.fn() };
    const insertStyles = insertionFactory();

    insertStyles(renderer as GriffelRenderer, { d: ['a'] });

    expect(useInsertionEffect).toHaveBeenCalledTimes(1);
    expect(renderer.insertCSSRules).toHaveBeenCalledTimes(1);
  });

  it('inserts the same rules once per renderer across mounts', () => {
    const rendererA: Partial<GriffelRenderer> = { id: 'a', insertCSSRules: vi.fn() };
    const rendererB: Partial<GriffelRenderer> = { id: 'b', insertCSSRules: vi.fn() };
    const insertStyles = insertionFactory();
    const cssRules = { d: ['a'] };

    insertStyles(rendererA as GriffelRenderer, cssRules);
    insertStyles(rendererA as GriffelRenderer, cssRules);
    insertStyles(rendererB as GriffelRenderer, cssRules);

    expect(useInsertionEffect).toHaveBeenCalledTimes(3);
    expect(rendererA.insertCSSRules).toHaveBeenCalledTimes(1);
    expect(rendererB.insertCSSRules).toHaveBeenCalledTimes(1);
  });

  it('inserts different rules for the same renderer', () => {
    const renderer: Partial<GriffelRenderer> = { id: 'a', insertCSSRules: vi.fn() };
    const insertStyles = insertionFactory();

    insertStyles(renderer as GriffelRenderer, { d: ['a'] });
    insertStyles(renderer as GriffelRenderer, { d: ['b'] });

    expect(renderer.insertCSSRules).toHaveBeenCalledTimes(2);
  });
});
