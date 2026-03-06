import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import type { GriffelRenderer } from '@griffel/core';

import { insertionFactory } from './insertionFactory';
import { useInsertionEffect as _useInsertionEffect } from './useInsertionEffect';
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
});
