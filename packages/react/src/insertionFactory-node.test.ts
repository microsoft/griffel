/*
 * @vitest-environment node
 */

// 👆 this is intentionally to test in SSR like environment

import { describe, it, expect, vi } from 'vitest';
import type { GriffelRenderer } from '@griffel/core';

const { useInsertionEffect } = vi.hoisted(() => ({
  useInsertionEffect: vi.fn(),
}));

vi.mock('react', async importOriginal => {
  const actual = await importOriginal<typeof import('react')>();
  return { ...actual, useInsertionEffect };
});

import { insertionFactory } from './insertionFactory.js';

describe('insertionFactory (node)', () => {
  it('does not use insertionEffect', () => {
    const renderer: Partial<GriffelRenderer> = { id: 'a', insertCSSRules: vi.fn() };
    const insertStyles = insertionFactory();

    insertStyles(renderer as GriffelRenderer, { d: ['a'] });

    expect(useInsertionEffect).not.toHaveBeenCalled();
    expect(renderer.insertCSSRules).toHaveBeenCalledTimes(1);
  });

  it('inserts CSS rules once per renderer instance, not per renderer id', () => {
    const rendererA: Partial<GriffelRenderer> = { id: 'same-id', insertCSSRules: vi.fn() };
    const rendererB: Partial<GriffelRenderer> = { id: 'same-id', insertCSSRules: vi.fn() };
    const insertStyles = insertionFactory();

    insertStyles(rendererA as GriffelRenderer, { d: ['a'] });
    insertStyles(rendererA as GriffelRenderer, { d: ['a'] });
    insertStyles(rendererB as GriffelRenderer, { d: ['a'] });

    expect(rendererA.insertCSSRules).toHaveBeenCalledTimes(1);
    expect(rendererB.insertCSSRules).toHaveBeenCalledTimes(1);
  });
});
